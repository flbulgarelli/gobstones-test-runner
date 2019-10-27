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
          "status":"failed",
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
        },
        {
          "status":"failed",
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
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
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
        },
        {
          "title": "Works with 3x3 board",
          "status":"failed",
          "initialBoard": "GBB/1.0\nsize 3 3\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 3 3\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 3 3\ncell 0 0 Rojo 1\nhead 0 0\n",
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

  context("evaluates tests with out_of_board", () => {
    const ast = {
      "tag":"EntryPoint",
      "contents":[
        "program",
        { "tag":"Application", "contents":[
            { "tag":"Reference", "contents":"Mover" },
            [ { "tag":"MuSymbol", "contents":"Norte" }] ]
        }
      ]
    }

    it("works when passed", () => {
      const result = runner.runTests({
        "code": "program { Mover(Norte) }",
        "examples": [
          {
            "initialBoard": "GBB/1.0\nsize 2 2\nhead 0 0",
            "expectedBoard": "GBB/1.0\nsize 2 2\nhead 0 1",
          },
          {
            "initialBoard": "GBB/1.0\nsize 1 1\nhead 0 0",
            "expectedError": "out_of_board"
          }
        ]
      })

      assert.deepStrictEqual(result, {
        "status": "passed",
        "results":[
          {
            "status":"passed",
            "initialBoard": "GBB/1.0\nsize 2 2\nhead 0 0\n",
            "expectedBoard": "GBB/1.0\nsize 2 2\nhead 0 1\n",
            "finalBoard": "GBB/1.0\nsize 2 2\nhead 0 1\n",
          },
          {
            "status":"passed",
            "initialBoard": "GBB/1.0\nsize 1 1\nhead 0 0\n",
            "expectedError": "out_of_board",
            "actualError": "out_of_board"
          }
        ],
        "mulangAst": ast
      })
    });

    it("works when failed", () => {
      const result = runner.runTests({
        "code": "program { Mover(Norte) }",
        "examples": [
          {
            "initialBoard": "GBB/1.0\nsize 3 3\nhead 0 0",
            "expectedError": "out_of_board"
          }
        ]
      })

      assert.deepStrictEqual(result, {
        "status": "failed",
        "results":[
          {
            "status":"failed",
            "initialBoard": "GBB/1.0\nsize 3 3\nhead 0 0\n",
            "expectedError": "out_of_board",
            "finalBoard": "GBB/1.0\nsize 3 3\nhead 0 1\n"
          }
        ],
        "mulangAst": ast
      })
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
          "status":"passed",
          "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
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
          "status":"failed",
          "initialBoard": "GBB/1.0\nsize 2 2\nhead 0 0\n",
          "expectedBoard": "GBB/1.0\nsize 2 2\nhead 0 0\n",
          "finalBoard": "GBB/1.0\nsize 2 2\ncell 0 0 Rojo 1\nhead 0 0\n",
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
