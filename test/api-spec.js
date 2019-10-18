var assert = require("assert");
const GobstonesTestRunner = require('../src/runner');
var GobstonesInterpreterApi = require("gobstones-interpreter").GobstonesInterpreterAPI;
const runner = new GobstonesTestRunner(new GobstonesInterpreterApi());

describe("api", () => {

  it("evaluates batches programatically", () => {
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
      "results":[
        {
          "status":"passed",
          "result":{
            "status":"failed",
            "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
            "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
            "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
            "returnValue":null
          }
        },
        {
          "status":"passed",
          "result":{
            "status":"failed",
            "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
            "expectedBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
            "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
            "returnValue":null
          }
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

  it("evaluates batches programatically with passed tests", () => {
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
      "results":[
        {
          "status":"passed",
          "result": {
            "status":"passed",
            "initialBoard": "GBB/1.0\nsize 4 4\nhead 0 0\n",
            "expectedBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
            "finalBoard": "GBB/1.0\nsize 4 4\ncell 0 0 Rojo 1\nhead 0 0\n",
            "returnValue":null
          }
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

  it("evaluates batches with tables", () => {
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
      "results":[
        {
          "status":"passed",
          "result":{
            "status":"failed",
            "initialBoard": "GBB/1.0\nsize 2 2\nhead 0 0\n",
            "expectedBoard": "GBB/1.0\nsize 2 2\nhead 0 0\n",
            "finalBoard": "GBB/1.0\nsize 2 2\ncell 0 0 Rojo 1\nhead 0 0\n",
            "returnValue":null
          }
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
