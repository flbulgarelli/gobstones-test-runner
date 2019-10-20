var assert = require("assert");
const GobstonesTestRunner = require('../src/runner');
var GobstonesInterpreterApi = require("gobstones-interpreter").GobstonesInterpreterAPI;
const runner = new GobstonesTestRunner(new GobstonesInterpreterApi());

describe("api", () => {

  it("evaluates tests", () => {
    const result = runner.runTests({
      "code": "program { Meter(Rojo) }",
      "extraCode": "procedure Meter(color) { Poner(color) }",
      "examples": [
        {
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0",
          "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0",
        },
        {
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0",
          "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0",
        }
      ]
    })

    assert.deepStrictEqual(result, {
      "status": "failed",
      "results":[
        {
          "interpreterStatus":"passed",
          "status":"failed",
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
          "returnValue":null
        },
        {
          "interpreterStatus":"passed",
          "status":"failed",
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
          "returnValue":null
        }
      ],
      "mulangAst":{
        "tag":"EntryPoint",
        "contents":[
          "program",
          {
            "tag":"Application",
            "contents":[
              {
                "tag":"Reference",
                "contents":"Meter"
              },
              [
                {
                  "tag":"MuSymbol",
                  "contents":"Rojo"
                }
              ]
            ]
          }
        ]
      }
    });
  });

   it("evaluates tests with titles", () => {
    const result = runner.runTests({
      "code": "program { Meter(Rojo) }",
      "extraCode": "procedure Meter(color) { Poner(color) }",
      "examples": [
        {
          "title": "Works with 4x4 board",
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0",
          "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0",
        },
        {
          "title": "Works with 3x3 board",
          "initialBoard": "GBB/1.0\nsize 3 3\nhead 0 0",
          "expectedBoard": "GBB/1.0\nsize 3 3\nhead 0 0",
        }
      ]
    })

    assert.deepStrictEqual(result, {
      "status": "failed",
      "results":[
        {
          "title": "Works with 4x4 board",
          "status":"failed",
          "interpreterStatus":"passed",
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
          "returnValue":null
        },
        {
          "title": "Works with 3x3 board",
          "status":"failed",
          "interpreterStatus":"passed",
          "initialBoard": "GBB/1.0\nsize 3 3\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 3 3\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 3 3\ncell 0 0 Rojo 1\nhead 0 0\n",
          "returnValue":null
        }
      ],
      "mulangAst":{
        "tag":"EntryPoint",
        "contents":[
          "program",
          {
            "tag":"Application",
            "contents":[
              {
                "tag":"Reference",
                "contents":"Meter"
              },
              [
                {
                  "tag":"MuSymbol",
                  "contents":"Rojo"
                }
              ]
            ]
          }
        ]
      }
    });
  });

  it("evaluates tests with passed tests", () => {
    const result = runner.runTests({
      "code": "program { Poner(Rojo) }",
      "examples": [
        {
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0",
          "expectedBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0",
        }
      ]
    })
    assert.deepStrictEqual(result, {
      "status": "passed",
      "results":[
        {
          "interpreterStatus":"passed",
          "status":"passed",
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
          "returnValue":null
        }
      ],
      "mulangAst":{
        "tag":"EntryPoint",
        "contents":[
          "program",
          {
            "tag":"Application",
            "contents":[
              {
                "tag":"Reference",
                "contents":"Poner"
              },
              [
                {
                  "tag":"MuSymbol",
                  "contents":"Rojo"
                }
              ]
            ]
          }
        ]
      }
    });
  });

  it("evaluates tests with ill-formed code", () => {
    const result = runner.runTests({
      "code": "program { Poner(Rojo) ",
      "examples": [
        {
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0",
          "expectedBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0",
        }
      ]
    })
    assert.deepStrictEqual(result, {
      "status": "errored",
      "interpreterStatus": "compilation_error",
      "message": "Se encontró una llave abierta \"{\" pero nunca se cierra.",
      "on": {
        "range": {
          "end": {
            "column": 10,
            "row": 1
          },
          "start": {
            "column": 9,
            "row": 1
          }
        },
        "region": ""
      },
      "reason": {
        "code": "unmatched-opening-delimiter",
        "detail": [ "{" ]
      }

    });
  });

  it("evaluates tests with tables", () => {
    const result = runner.runTests({
      "code": "program { Meter(Rojo) }",
      "extraCode": "procedure Meter(color) { Poner(color) }",
      "examples": [
        {
          "initialBoard": {head: {x: 0, y: 0}, width: 2, height: 2, table: [[{}, {}], [{}, {}]]},
          "expectedBoard": {head: {x: 0, y: 0}, width: 2, height: 2, table: [[{}, {}], [{}, {}]]}
        }
      ]
    });

    assert.deepEqual(result, {
      "status": "failed",
      "results":[
        {
          "interpreterStatus":"passed",
          "status":"failed",
          "initialBoard": "GBB/1.0\nsize 2 2\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 2 2\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 2 2\ncell 0 0 Rojo 1\nhead 0 0\n",
          "returnValue":null
        }
      ],
      "mulangAst":{
        "tag":"EntryPoint",
        "contents":[
          "program",
          {
            "tag":"Application",
            "contents":[
              {
                "tag":"Reference",
                "contents":"Meter"
              },
              [
                {
                  "tag":"MuSymbol",
                  "contents":"Rojo"
                }
              ]
            ]
          }
        ]
      }
    });
  });
});
