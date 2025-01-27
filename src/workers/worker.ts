import * as acorn from "acorn";
import * as walk from "acorn-walk";
import { generate } from "astring";
import objectInspect from "object-inspect";

onmessage = async (event) => {
  // const dom = new JSDOM(`<!DOCTYPE html><p>Hello world!</p>`, {
  //   url: "http://localhost/",
  // });

  const { code } = event.data;
  let results;
  try {
    console.log({ code });
    const ast = acorn.parse(`${code}`, {
      ecmaVersion: 2025,
      sourceType: "module",
      allowAwaitOutsideFunction: true,
    });

    const prologue = acorn.parse(
      `
      var results = [];
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

      for(let i = 0; i<=consoleMethods.length;i++) {
        const originalMethod = console[consoleMethods[i]];
        console[consoleMethods[i]] = function (...args) {
          originalMethod(...args);

          if (args.length === 1) {
            return args[0];
          }

          return args
          .map((item) => {
            if (typeof item === "object") {
              return objectInspect(item, {depth: 2});
            }
            if(typeof item === 'string') {
              return "'"+item+"'"
            }
              return String(item)
            
          })
          .join(" ");

        }
      }

      function __report(value, line, time) {
        results.push({
        line: line,
        text: value,
        time: time,
      });
        return value;
      }
    `,
      { ecmaVersion: 2020 }
    ).body;
    console.log("funciono");
    walk.simple(ast, {
      ExpressionStatement(node) {
        const allowed: (typeof node.expression.type)[] = [
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

          Object.keys(node).forEach(
            (key) => delete node[key as keyof acorn.ExpressionStatement]
          );
          Object.assign(node, instrumentedNode);
        }
      },
    });

    const epilogue = acorn.parse(`results`, { ecmaVersion: 2025 }).body;

    ast.body = [...prologue, ...ast.body, ...epilogue];

    const instrumentedCode = generate(ast);

    const finalCode = `
    (async () => {
      ${instrumentedCode}
      return results;
    })()
  `;

    const unformat = await eval(finalCode);

    console.log({ unformat });

    results = unformat.map((r: { text: unknown }) => {
      console.log({ r });
      const isText = typeof r.text === "string";

      if (isText) {
        let text = r.text as string;

        if(!text.includes("'")) {
          text = `'${text}'`
        }
        return {
          ...r,
          text,
        };
      }

      if (Array.isArray(r.text)) {
        let array = r.text;
        if (array.length > 9999) {
          array = [
            ...array.slice(0, 9999),
            `... ${array.length - 9999} more items`,
          ];
        }
        return {
          ...r,
          text: objectInspect(array),
        };
      }

      return {
        ...r,
        text: objectInspect(r.text, { indent: "\t" }),
      };
    });
    console.log({ results });
  } catch (ex) {
    const { message, stack } = ex as Error;
    results = [
      {
        line: 0,
        text: message || stack,
        time: 0,
      },
    ];
  } finally {
    console.log(results);
    postMessage(results);
  }
};
