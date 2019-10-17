var assert = require("assert");
const GobstonesTestRunner = require('../src/api');
const runner = new GobstonesTestRunner()

describe("api", () => {

  it("evaluates batches programatically", (done) => {
    runner.runTests({
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
    }, (result) => {
      assert.deepStrictEqual(result,
        {
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
      done()
    }, (error) => {
      assert.fail(error);
      done();
    });
  });

  it("evaluates batches with tables", (done) => {
    runner.runTests({
      "code": "program { Meter(Rojo) }",
      "extraCode": "procedure Meter(color) { Poner(color) }",
      "examples": [
        {
          "initialBoard": {head: {x: 0, y: 0}, width: 2, height: 2, table: [[{}, {}], [{}, {}]]},
          "expectedBoard": {head: {x: 0, y: 0}, width: 2, height: 2, table: [[{}, {}], [{}, {}]]}
        }
      ]
    }, (result) => {
      assert.deepEqual(result,
        {
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
        }
      );
      done()
    }, (error) => {
      assert.fail(error);
      done();
    });
  });
});
