import { generate } from "astring";
import * as walk from "acorn-walk";
import * as acorn from "acorn";
import { formatError } from "./errorUtils";

interface CallExpression extends acorn.Node {
  type: 'CallExpression';
  callee: {
    type: string;
    object?: {
      name?: string;
    };
  };
}

function isCallExpression(node: any): node is CallExpression {
  return node?.type === 'CallExpression';
}

// ===== AST Node Helpers =====

function createTimingStartNode() {
  return {
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: "__start" },
        init: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "performance" },
            property: { type: "Identifier", name: "now" },
            computed: false,
          },
          arguments: [],
        },
      },
    ],
    kind: "const",
  };
}

function createResultCaptureNode(expression: any) {
  return {
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: "__result" },
        init: expression,
      },
    ],
    kind: "const",
  };
}

function createTimingEndNode() {
  return {
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: "__end" },
        init: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "performance" },
            property: { type: "Identifier", name: "now" },
            computed: false,
          },
          arguments: [],
        },
      },
    ],
    kind: "const",
  };
}

function createReportNode(lineNumber: number, isConsole: boolean) {
  return {
    type: "ExpressionStatement",
    expression: {
      type: "CallExpression",
      callee: { type: "Identifier", name: "__report" },
      arguments: [
        { type: "Identifier", name: "__result" },
        { type: "Literal", value: lineNumber },
        {
          type: "BinaryExpression",
          operator: "-",
          left: { type: "Identifier", name: "__end" },
          right: { type: "Identifier", name: "__start" },
        },
        { type: "Literal", value: isConsole },
      ],
    },
  };
}

function createInstrumentedNode(
  originalExpression: any,
  lineNumber: number,
  isConsole: boolean
) {
  return {
    type: "ExpressionStatement",
    expression: {
      type: "CallExpression",
      callee: {
        type: "ArrowFunctionExpression",
        id: null,
        params: [],
        body: {
          type: "BlockStatement",
          body: [
            createTimingStartNode(),
            createResultCaptureNode(originalExpression),
            createTimingEndNode(),
            createReportNode(lineNumber, isConsole),
            {
              type: "ReturnStatement",
              argument: { type: "Identifier", name: "__result" },
            },
          ],
        },
        expression: false,
        async: true,
        generator: false,
      },
      arguments: [],
    },
  };
}

// ===== Runtime Wrapper =====

function buildRuntimeWrapper(
  instrumentedCode: string,
  importsCode: string
): string {
  return `
      import { inspect } from 'util';
      ${importsCode}

  (async () => {

        let logger;
        function customLog(...args) {
          return args
          .map((item) => {
            if (typeof item === "object" || Array.isArray(item)) {
              return inspect(item, { showHidden: true, depth: null, maxArrayLength: 10000, colors: false, getters: true, showProxy: true });
            }
            if(typeof item === 'string') {
              if(item.includes("'")) {
                return '\\"'+item+'\\"'
              }
              return "\\'"+item+"\\'"
            }
            return String(item)
          })
          .join(" ");
        }

        var consoleMethods = [
          'log',
          'error',
          'warn',
          'info',
          'debug',
          'time',
          'timeEnd',
          'trace',
          'assert',
          'count',
          'group',
          'groupEnd',
          'table',
          'dir',
          'dirxml',
          'profile',
          'profileEnd',
          'clear',
          'countReset',
          'groupCollapsed'
        ];

        logger = console.log
        for (let i = 0; i < consoleMethods.length; i++) {
          console[consoleMethods[i]] = (...arg) => arg;
        }

        function __report(value, line, time, isConsole) {
          return logger(JSON.stringify({
            line: line,
            text: isConsole ? customLog(...value) : customLog(value),
            time: time,
          }));
        }

        ${instrumentedCode}
      })()
    `;
}

// ===== Main Function =====

export function addInstructionsToCode(code: string) {
  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 2025,
      sourceType: "module",
      allowAwaitOutsideFunction: true,
    });

    const imports: acorn.ImportDeclaration[] = [];

    ast.body = ast.body.filter((node) => {
      if (node.type === "ImportDeclaration") {
        imports.push(node);
        return false;
      }
      if (
        node.type === "ExportNamedDeclaration" &&
        (node as any).specifiers?.length === 0 &&
        !(node as any).declaration &&
        !(node as any).source
      ) {
        return false;
      }
      return true;
    });

    walk.simple(ast, {
      ExpressionStatement(node) {
        const allowed = [
          "CallExpression",
          "Identifier",
          "BinaryExpression",
          "Literal",
          "ArrayExpression",
        ];

        const isConsole =
          isCallExpression(node.expression) &&
          node.expression.callee?.object?.name === "console";

        if (allowed.includes(node.expression.type)) {
          const substring = code.slice(0, node.start);
          const lineNumber = substring.split("\n").length;

          const instrumentedNode = createInstrumentedNode(
            node.expression,
            lineNumber,
            isConsole
          );

          Object.keys(node).forEach(
            (key) => delete node[key as keyof acorn.ExpressionStatement]
          );
          Object.assign(node, instrumentedNode);
        }
      },
    });

    const instrumentedCode = generate(ast);
    const importsCode = generate({ type: "Program", body: imports } as any);

    return buildRuntimeWrapper(instrumentedCode, importsCode);
  } catch (e) {
    const safeMessage = JSON.stringify(`Error al procesar el codigo: ${formatError(e)}`);
    return `console.error(${safeMessage}); process.exit(1);`;
  }
}
