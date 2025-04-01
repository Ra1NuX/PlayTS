import { generate } from "astring";
import * as walk from "acorn-walk";
import * as acorn from "acorn";

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
      } else {
        return true;
      }
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

        console.log(node.expression.type)

        const isConsole = isCallExpression(node.expression) && 
          node.expression.callee?.object?.name === "console";

        if (allowed.includes(node.expression.type)) {
          const substring = code.slice(0, node.start);
          const lineNumber = substring.split("\n").length;

          const instrumentedNode = {
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
                    // const __start = performance.now();
                    {
                      type: "VariableDeclaration",
                      declarations: [
                        {
                          type: "VariableDeclarator",
                          id: { type: "Identifier", name: "__start" },
                          init: {
                            type: "CallExpression",
                            callee: {
                              type: "MemberExpression",
                              object: {
                                type: "Identifier",
                                name: "performance",
                              },
                              property: { type: "Identifier", name: "now" },
                              computed: false,
                            },
                            arguments: [],
                          },
                        },
                      ],
                      kind: "const",
                    },
                    // const __result = <original expression>;
                    {
                      type: "VariableDeclaration",
                      declarations: [
                        {
                          type: "VariableDeclarator",
                          id: { type: "Identifier", name: "__result" },
                          init: node.expression,
                        },
                      ],
                      kind: "const",
                    },
                    // const __end = performance.now();
                    {
                      type: "VariableDeclaration",
                      declarations: [
                        {
                          type: "VariableDeclarator",
                          id: { type: "Identifier", name: "__end" },
                          init: {
                            type: "CallExpression",
                            callee: {
                              type: "MemberExpression",
                              object: {
                                type: "Identifier",
                                name: "performance",
                              },
                              property: { type: "Identifier", name: "now" },
                              computed: false,
                            },
                            arguments: [],
                          },
                        },
                      ],
                      kind: "const",
                    },
                    // __report(__result, lineNumber, __end - __start, isConsole);
                    {
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
                          {
                            type: 'Literal',
                            value: isConsole,
                          }
                        ],
                      },
                    },
                    // return __result;
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

          // Reemplazar el nodo original con el nodo instrumentado
          Object.keys(node).forEach(
            (key) => delete node[key as keyof acorn.ExpressionStatement]
          );
          Object.assign(node, instrumentedNode);
        }
      },
    });

    const instrumentedCode = generate(ast);
    const importsCode = generate({ type: "Program", body: imports } as any);
    const finalCode = `
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
    return finalCode;
  } catch (e) {
    return "Error al procesar el código";
  }
}
