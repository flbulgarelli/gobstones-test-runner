var mulang = require('./mulang');
var _ = require("lodash");

const PUBLIC_ERROR_CODES = {
  "cannot-move-to": "out_of_board",
  "cannot-remove-stone": "no_stones",
  "primitive-argument-type-mismatch": "wrong_argument_type"
};

function publicErrorCodeFor(errorCode) {
  return PUBLIC_ERROR_CODES[errorCode] || errorCode;
}

class GobstonesTestRunner {
  constructor(interpreter) {
    this.interpreter = interpreter;
  }

  // run multiple batch actions
  runTests(spec) {
    this._validateTests(spec);

    const code = _.trim(spec.code || "");
    const extraCode = _.trim(spec.extraCode || "");
    const options = spec.options || {};
    try {
      const mulangAst = this.getMulangAst(code);
      const testResults = this._processExamples(spec.examples, code, extraCode, options);
      return this._buildTestResult(testResults, mulangAst);
    } catch (e) {
      if (e.status) {
        return Object.assign({ status: 'errored' }, e.error);
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
      if (!program) return { status: "no_program_found" };

      const result = this._interpret(program, initialBoard);
      const finalBoard = this._buildBoard(result.finalBoard);

      return {
        status: "passed",
        returnValue: result.returnValue,
        finalBoard
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
        error: result
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
        error: result
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

  _processExamples(examples, code, extraCode, options) {
    return examples.map((example) => this._processExample(example, code, extraCode, options));
  }

  _parseGbbIfNeeded(gbbOrBoard) {
    var board;
    if (_.isString(gbbOrBoard)) {
      board = this._readGbb(gbbOrBoard);
    } else {
      board = gbbOrBoard;
    }
    return this._buildBoard(board);
  }

  _buildBatchCode(code, extraCode) {
    return code + "\n" + extraCode;
  }

  _processExample(originalExample, code, extraCode, options) {
    const example = Object.assign({}, originalExample);
    let exampleResult;
    try {
      var finalStudentCode = example.codeOverride || code;
      var finalCode = this._buildBatchCode(finalStudentCode, extraCode);
      example.initialBoard = this._parseGbbIfNeeded(example.initialBoard);
      example.expectedBoard = !_.isUndefined(example.expectedBoard) ? this._parseGbbIfNeeded(example.expectedBoard) : undefined;
      exampleResult = this._evaluateExampleResult(this.run(finalCode, example.initialBoard), example, options);
    } catch (error) {
      exampleResult = { status: 'errored', error};
    }
    if (example.title) {
      exampleResult.title = example.title;
    }
    return exampleResult;
  }

  _evaluateExampleResult(report, example, options) {
    var result = {
      initialBoard: example.initialBoard.gbb,
      //TODO returnValue: report.returnValue,
    };

    if (report.finalBoard && report.finalBoard.table && example.expectedBoard) {
      // has final board and expected board
      result.expectedBoard = example.expectedBoard.gbb;
      result.finalBoard = report.finalBoard.gbb;
      result.status = this._compareBoards(example.expectedBoard, report.finalBoard, options) ? 'passed' : 'failed'
    } else if (report.error && example.expectedError) {
      // has actual error and expected error
      result.actualError = publicErrorCodeFor(report.error.reason.code);
      result.expectedError = publicErrorCodeFor(example.expectedError);
      result.status = result.actualError === result.expectedError ? 'passed' : 'failed';
    } else if (example.expectedBoard) {
      // has actual error and expected board
      result.expectedBoard = example.expectedBoard.gbb;
      result.actualError = publicErrorCodeFor(report.error.reason.code);
      result.status = 'failed';
    } else {
      // has final board and expected error
      result.finalBoard = report.finalBoard.gbb;
      result.expectedError = example.expectedError;
      result.status = 'failed';
    }

    return result;
  }

  _compareBoards(expected, final, options) {
    return _.isEqual(expected.table, final.table) && (!options.checkHeadPosition || _.isEqual(expected.head,final.head));
  }

  _validateTests(tests) {
    if (!_.isString(tests.code))
      throw new Error("`code` should be a string.");
    if (tests.extraCode != null && !_.isString(tests.extraCode))
      throw new Error("`extraCode` should be a string.");
    if (!_.isArray(tests.examples))
      throw new Error("`examples` should be an array.");
    if (!_.isArray(tests.examples))
      throw new Error("`examples` should be an array.");
    if (tests.examples.some(it => it.expectedBoard && it.expectedError))
      throw new Error("An example must have `expectedBoard` or `expectedError`, but not both.");
  }

  _buildTestResult(exampleResults, mulangAst) {
    let status;
    if (exampleResults.every((it) =>  it.status === 'passed')) {
      status = 'passed';
    } else if (exampleResults.some((it) =>  it.status === 'errored')) {
      status = 'errored';
    } else {
      status = 'failed';
    }
    return {status: status, results: exampleResults, mulangAst: mulangAst};
  }
}

module.exports = GobstonesTestRunner;
