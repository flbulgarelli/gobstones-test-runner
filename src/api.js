var mulang = require('./mulang');
var GobstonesInterpreterApi = require("gobstones-interpreter").GobstonesInterpreterAPI;
var _ = require("lodash");

class GobstonesRunnner {
  constructor(options = {}) {
    this.options = options;
  }

  // run multiple batch actions
  runBatch(batch, action, onError) {
    this._validateBatch(batch);

    var code = _.trim(batch.code || "");
    var extraCode = _.trim(batch.extraCode || "");

    this._withCode((extraCode) => {
      this._withCode((code) => {
        try {
          var mulangAst = this.getMulangAst(code);
          this._processExamples(batch.examples, code, extraCode,
            (results) => action(this._buildBatchResult(results, mulangAst)), onError);
        } catch (e) {
          onError(e);
        }
      }, code);
    }, extraCode);
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
    const program = this._parseProgram(code);
    if (!program) throw { status: "no_program_found" };
    const result = this._interpret(program, initialBoard);
    const executionReport = this._buildBoard(result.finalBoard);
    executionReport.returnValue = result.returnValue;

    return {
      status: "passed",
      result: executionReport
    }
  }

  _runOperation(code, operation) {
    var result = this._interpreter()[operation](code);

    if (result.reason)
      throw {
        status: "compilation_error",
        result: result
      };

    return result;
  }

  _interpreter() {
    var gobstonesApi = new GobstonesInterpreterApi();
    var timeout = parseInt(this.options.timeout);

    if (_.isFinite(timeout))
      gobstonesApi.config.setInfiniteLoopTimeout(timeout);

    if (this.options.language)
      gobstonesApi.config.setLanguage(this.options.language);

    return gobstonesApi;
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
    return this._interpreter().gbb.read(gbb);
  }

  _buildGbb(board) {
    return this._interpreter().gbb.write(board);
  }

  _buildBoard(board) {
    board.gbb = this._buildGbb(board);
    return board;
  }

  _parseProgram(code) {
    return this.parse(code).program;
  }

  _processExamples(examples, code, extraCode, action, _onError) {
    action(examples.map((example) => this._processExample(example, code, extraCode)));
  }

  _getBoardFromGbb (gbbOrBoard) {
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
    try {
      var finalStudentCode = example.codeOverride || code;
      var finalCode = this._buildBatchCode(finalStudentCode, extraCode);
      var initialBoard = this._getBoardFromGbb(example.initialBoard);
      var expectedBoard = !_.isUndefined(example.expectedBoard) ? this._getBoardFromGbb(example.expectedBoard) : undefined;
      return this._makeBatchReport(this.run(finalCode, initialBoard), initialBoard, expectedBoard);
    } catch (error) {
      return this._makeBatchReport(error, initialBoard, expectedBoard, "finalBoardError");
    }
  }

  _makeBatchReport (report, initialBoard, expectedBoard, finalBoardKey) {
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

  _withCode (action, code) {
    action(code);
  }

  _validateBatch(batch) {
    if (!_.isString(batch.code))
      throw new Error("`code` should be a string.");
    if (batch.extraCode != null && !_.isString(batch.extraCode))
      throw new Error("`extraCode` should be a string.");
    if (!_.isArray(batch.examples))
      throw new Error("`examples` should be an array.");

  }

  _buildBatchResult(exampleResults, mulangAst) {
    return {results: exampleResults, mulangAst: mulangAst};
  }
}

module.exports = GobstonesRunnner;
