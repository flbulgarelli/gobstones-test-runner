var mulang = require('./mulang');
var _ = require("lodash");

class GobstonesTestRunner {
  constructor(interpreter) {
    this.interpreter = interpreter;
  }

  // run multiple batch actions
  runTests(tests) {
    this._validateTests(tests);

    const code = _.trim(tests.code || "");
    const extraCode = _.trim(tests.extraCode || "");
    try {
      const mulangAst = this.getMulangAst(code);
      const testResults = this._processExamples(tests.examples, code, extraCode);
      return this._buildTestResult(testResults, mulangAst);
    } catch (e) {
      if (e.status) {
        return Object.assign(
          {
            status: 'errored',
            interpreterStatus: e.status
          }, e.result);
      }
      throw e;
    }
  }

  // parse
  parse(code) {
    return this._runOperation(code, 'parse');
  }
  // get mulang ast
  getMulangAst(code) {
    return mulang.parse(this.getAst(code));
  }

  // get native ast
  getAst(code) {
    return this._runOperation(code, "getAst");
  }

  // run code
  run(code, initialBoard) {
    try {
      const program = this._parseProgram(code);
      if (!program) throw { status: "no_program_found" };
      const result = this._interpret(program, initialBoard);
      const executionReport = this._buildBoard(result.finalBoard);
      executionReport.returnValue = result.returnValue;
      return {
        status: "passed",
        result: executionReport
      }
    } catch (e) {
      if (e.status) {
        return e;
      }
      throw e;
    }
  }

  _runOperation(code, operation) {
    var result = this.interpreter[operation](code);

    if (result.reason)
      throw {
        status: "compilation_error",
        result: result
      };

    return result;
  }

  _interpret(program, board) {
    var result = program.interpret(board);

    if (result.reason) {
      if (result.reason.code === "timeout") {
        result.on.regionStack = [];
        result.snapshots = [];
      }

      throw {
        status: "runtime_error",
        result: result
      };
    }

    return result;
  }

  _readGbb(gbb) {
    return this.interpreter.gbb.read(gbb);
  }

  _buildGbb(board) {
    return this.interpreter.gbb.write(board);
  }

  _buildBoard(board) {
    board.gbb = this._buildGbb(board);
    return board;
  }

  _parseProgram(code) {
    return this.parse(code).program;
  }

  _processExamples(examples, code, extraCode) {
    return examples.map((example) => this._processExample(example, code, extraCode));
  }

  _parseGbbIfNeeded(gbbOrBoard) {
    var board;
    if (_.isString(gbbOrBoard)) {
      board = this._readGbb(gbbOrBoard);
    } else {
      board = gbbOrBoard
    }
    return this._buildBoard(board);
  }

  _buildBatchCode(code, extraCode) {
    return code + "\n" + extraCode;
  }

  _processExample(example, code, extraCode) {
    let exampleResult;
    try {
      var finalStudentCode = example.codeOverride || code;
      var finalCode = this._buildBatchCode(finalStudentCode, extraCode);
      var initialBoard = this._parseGbbIfNeeded(example.initialBoard);
      var expectedBoard = !_.isUndefined(example.expectedBoard) ? this._parseGbbIfNeeded(example.expectedBoard) : undefined;
      exampleResult = this._buildExampleResult(this.run(finalCode, initialBoard), initialBoard, expectedBoard);
    } catch (error) {
      exampleResult = this._buildExampleResult(error, initialBoard, expectedBoard, "finalBoardError");
    }
    exampleResult.title = example.title;
    return exampleResult;
  }

  _buildExampleResult (report, initialBoard, expectedBoard, finalBoardKey) {
    var result = {
      initialBoard: initialBoard,
      expectedBoard: expectedBoard,
    };
    result[finalBoardKey || "finalBoard"] = report.result;
    if (result.finalBoard) {
      result.status = _.isEqual(result.expectedBoard.table, result.finalBoard.table) ? 'passed' : 'failed';
      result.returnValue = result.finalBoard.returnValue;
      result.finalBoard = result.finalBoard.gbb;
    }
    result.initialBoard = result.initialBoard.gbb;
    result.expectedBoard = result.expectedBoard.gbb;
    report.result = result;

    return report;
  }

  _validateTests(tests) {
    if (!_.isString(tests.code))
      throw new Error("`code` should be a string.");
    if (tests.extraCode != null && !_.isString(tests.extraCode))
      throw new Error("`extraCode` should be a string.");
    if (!_.isArray(tests.examples))
      throw new Error("`examples` should be an array.");

  }

  _buildTestResult(exampleResults, mulangAst) {
    let status;
    if (exampleResults.some((it) =>  it.status !== 'passed')) {
      status = 'errored';
    } else if (exampleResults.every((it) =>  it.result.status == 'passed')) {
      status = 'passed';
    } else {
      status = 'failed';
    }

    exampleResults = exampleResults.map((it) => {
      it.result.interpreterStatus = it.status;
      if (it.title) it.result.title = it.title;
      return it.result;
    });
    return {status: status, results: exampleResults, mulangAst: mulangAst};
  }
}

module.exports = GobstonesTestRunner;
