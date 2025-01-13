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
    const ast = acorn.parse(code, {
      ecmaVersion: 2025,
      sourceType: "script",
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
        console[consoleMethods[i]] = function (...arg) {
          if(arg.length === 1) {
            return arg[0]
          }else {
            return arg;
          }
        }
      }

      function __report(value, line) {
        results.push({
        line: line,
        text: value,
        time: 0,
      });
        return value;
      }
    `,
      { ecmaVersion: 2020 }
    ).body;

    walk.simple(ast, {
      ExpressionStatement(node) {
        console.log(
          "Encontrada expresión:",
          node.expression.type,
          "->",
          code.slice(node.expression.start, node.expression.end)
        );
        const allowed: (typeof node.expression.type)[] = [
          "CallExpression",
          "Identifier",
          "BinaryExpression",
          "Literal",
        ];
        if (allowed.includes(node.expression.type)) {
          const substring = code.slice(0, node.start);

          const lineNumber = substring.split("\n").length;

          node.expression = {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: "__report",
              start: node.expression.start,
              end: node.expression.end,
            },
            arguments: [
              node.expression,
              {
                type: "Literal",
                value: lineNumber,
                start: node.expression.start,
                end: node.expression.end,
              },
            ],
            optional: false,
            start: node.start,
            end: node.end,
          };
        }
      },
    });

    const epilogue = acorn.parse(
      `
      results;
    `,
      { ecmaVersion: 2025 }
    ).body;

    ast.body = [...prologue, ...ast.body, ...epilogue];

    const instrumentedCode = generate(ast);

    const unformat = eval(instrumentedCode);

    results = unformat.map((r: { text: unknown }) => {
      console.log({ r });
      const isText = typeof r.text === "string";

      return {
        ...r,
        text: !isText ? objectInspect(r.text) : JSON.stringify(r.text),
      };
    });
  } catch (error) {
    console.log({ error });
    results = [
      {
        line: 0,
        text: error.message,
        time: 0,
      },
    ];
  } finally {
    console.log({ results });
    postMessage(results);
  }
};
