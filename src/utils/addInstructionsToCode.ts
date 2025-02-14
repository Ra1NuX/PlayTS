import { generate } from "astring";
import * as walk from "acorn-walk";
import * as acorn from "acorn";

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
        ];

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
                    // __report(__result, lineNumber, __end - __start);
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

    // Convertir el AST instrumentado de vuelta a código
    const instrumentedCode = generate(ast);
    const importsCode = generate({ type: "Program", body: imports } as any);
    const finalCode = `
      import { inspect } from 'util';
      ${importsCode}
      
  (async () => {

        function customLog(...args) {
          if (args.length === 1) {

            return args[0];
          }
          return args
          // .map((item) => {
          //   if (typeof item === "object") {
          //     return inspect(item, { showHidden: true, depth: null, maxArrayLength: 10000, colors: false, getters:true, showProxy: true });
          //   }
          //   if(typeof item === 'string') {
          //     return "'"+item+"'"
          //   }
          //   return String(item)
          // })
          // .join(" ");

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
        
        const logger = {};
  
        for (let i = 0; i < consoleMethods.length; i++) {
          logger[consoleMethods[i]] = console[consoleMethods[i]];
          console[consoleMethods[i]] = customLog;
        }  
        function __report(value, line, time) {

          const notObject = typeof value !== 'object';
          const isText = typeof value === 'string';

          const formattedValue = isText ? \`'\${value}'\` : inspect(value, { showHidden: true, depth: null, maxArrayLength: 10000, colors: false, getters:true, showProxy: true });

          logger.log(JSON.stringify({
            line: line,
            text: formattedValue,
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
