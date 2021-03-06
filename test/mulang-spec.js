var should = require("should");
var _ = require("lodash");

var GobstonesTestRunner = require("../src/runner");
var mulang = require("../src/mulang");

var GobstonesInterpreterApi = require("gobstones-interpreter").GobstonesInterpreterAPI;

var s = mulang.s;
var callable = mulang.callable;
var reference = mulang.reference;

function program(body) {
  return entryPoint("program", body);
}

function interactiveProgram(body) {
  return entryPoint("interactiveProgram", body)
}

function entryPoint(name, body) {
  return s("EntryPoint", [name, body]);
}
var none = s("None");

function ast(code) {
  return new GobstonesTestRunner(new GobstonesInterpreterApi()).getMulangAst(code);
}

describe("gobstones - mulang", function() {
  it("translates programs with return", function() {
    ast("program { result := foo(); return (result) }").should.eql(
      program(s("Sequence", [
        s("Assignment",["result", s("Application", [reference("foo"), []])]),
        s("Return", reference("result"))]))
    );
  });

  it("translates simple Gobstones program", function() {
    ast("program {}").should.eql(program(none));
  });

  it("translates simple procedure Call", function() {
    ast("program{F()}").should.eql(program(s("Application", [reference("F"), []])));
  });

  it("translates simple procedure declaration ", function() {
    ast("procedure F(){}").should.eql(callable("Procedure", "F", [], none));
  });

  it("translates simple procedure declaration and application with a parameter", function() {
    var code = ast("procedure Foo(p){}\nprogram{Foo(2)}");

    code.should.eql(
      s("Sequence", [
        callable("Procedure", "Foo", [s("VariablePattern", "p")], none),
        program(s("Application", [reference("Foo"), [s("MuNumber", 2.0)]]))
      ])
    );
  });

  it("translates simple procedure Application ", function() {
    var code = ast("program{Bar()} procedure Bar(){}");

    code.should.eql(s("Sequence", [
      program(s("Application", [reference("Bar"), []])),
      callable("Procedure", "Bar", [], none)]));
  });

  it("translates Poner", function() {
    var code = ast("program{Poner(Verde)}");

    code.should.eql(
      program(s("Application", [reference("Poner"), [s("MuSymbol", "Verde")]])));
  });

  it("translates Sacar", function() {
    var code =  ast("program{Sacar(Verde)}");

    code.should.eql(
      program(s("Application", [reference("Sacar"), [s("MuSymbol", "Verde")]])));
  });

  it("translates Mover", function() {
    var code = ast("program{Mover(Este)}");

    code.should.eql(
      program(s("Application", [reference("Mover"), [s("MuSymbol", "Este")]])));
  });

  it("translates simple function declaration, with color return", function() {
    var code = ast("function f(){return (Verde)}");

    code.should.eql(callable("Function", "f", [], s("Return", s("MuSymbol", "Verde"))));
  });

  it("translates simple function declaration, with numeric return", function() {
    var code = ast("function f(parameter){return (2)}");

    code.should.eql(
      callable("Function", "f", [s("VariablePattern", "parameter")], s("Return", s("MuNumber", 2))));
  });

  it("translates simple variable assignment of numbers", function() {
    var code = ast("program{x:= 1}");

    code.should.eql(program(s("Assignment", ["x", s("MuNumber", 1)])));
  });

  it("translates simple variable assignment of colors", function() {
    var code = ast("program{x:= Verde}");

    code.should.eql(program(s("Assignment", ["x", s("MuSymbol", "Verde")])));
  });

  it("translates simple variable assignment of booleans", function() {
    var code = ast("program{x:= True}");

    code.should.eql(program(s("Assignment", ["x", s("MuBool", true)])));
  });

  it("translates simple variable assignment of directions", function() {
    var  code = ast("program{x:= Este}");

    code.should.eql(program(s("Assignment", ["x", s("MuSymbol", "Este")])));
  });

  it("translates simple variable assignment of references", function() {
    var code = ast("program{x:= y}");

    code.should.eql(program(s("Assignment", ["x", reference("y")])));
  });

  it("translates simple variable assignment of application", function() {
    var code = ast("program{x:= f(2)}");

    code.should.eql(
      program(s("Assignment", ["x", s("Application", [reference("f"), [s("MuNumber", 2.0)]])]))
    );
  });

  it("translates simple variable assignment if binary", function() {
    var code = ast("program{x:= z && y}");

    code.should.eql(
      program(s("Assignment", ["x", s("Application", [reference("&&"), [reference("z"), reference("y")]])]))
    );
  });

  it("translates simple variable assignment of not", function() {
    var code = ast("program{x:= not z}");

    code.should.eql(
      program(s("Assignment", ["x", s("Application", [reference("not"), [reference("z")]])]))
    );
  });

  it("translates simple variable assignment of nested binaries", function() {
    var code = ast("program{x := True == 2 && x /= t}");

    code.should.eql(
      program(
        s("Assignment", [
          "x",
          s("Application", [
            reference("&&"), [
              s("Application", [s("Equal"),    [s("MuBool", true), s("MuNumber", 2.0)]]),
              s("Application", [s("NotEqual"), [reference("x"), reference("t")]])
            ]])]))
    );
  });

  it("translates simple procedure declaration and application with a parameter", function() {
    var code = ast("program{F(Negro)}\nprocedure F(parameter){}");

    code.should.eql(
      s("Sequence", [
        program(s("Application", [reference("F"), [s("MuSymbol", "Negro")]])),
        callable("Procedure", "F", [s("VariablePattern", "parameter")], none)
      ])
    );
  });

  it("translates conditional declaration", function() {
    var code = ast("program{if(True){}}");

    code.should.eql(
      program(s("If", [s("MuBool", true), none, none]))
    );
  });

  it("translates conditional declaration, with branches", function() {
    var code = ast("program{if(True){x := 1}}");

    code.should.eql(
      program(s("If", [
        s("MuBool", true),
        s("Assignment", ["x", s("MuNumber", 1.0)]),
        none]))
    );
  });

  it("translates while declaration", function() {
    var code = ast("program{while(True){}}");

    code.should.eql(program(s("While", [s("MuBool", true), none])));
  });

  it("translates while declaration with body", function() {
    var code = ast("program{while(True){x := 1}}");

    code.should.eql(
      program(s("While", [
        s("MuBool", true),
        s("Assignment", ["x", s("MuNumber", 1.0)])]))
    );
  });

  it("translates switch declaration with colors", function() {
    var code = ast("program{switch(Verde) to {Rojo -> {x := 4}}}");

    code.should.eql(
      program(
        s("Switch", [
          s("MuSymbol", "Verde"),
          [[s("MuSymbol", "Rojo"), s("Assignment", ["x", s("MuNumber", 4.0)])]],
          s("None")
        ]))
    );
  });

  it("translates switch declaration with numbers", function() {
    var code = ast("program{switch(5) to {3 -> {x := 4}}}");

    code.should.eql(
      program(
        s("Switch", [
          s("MuNumber", 5.0),
          [[s("MuNumber", 3.0), s("Assignment", ["x", s("MuNumber", 4.0)])]],
          s("None")
        ]))
    );
  });

  it("translates repeat declaration", function() {
    var code = ast("program{repeat(2){x := 2}}");

    code.should.eql(
      program(s("Repeat", [
        s("MuNumber", 2.0),
        s("Assignment", ["x", s("MuNumber", 2.0)])]))
    );
  });

  it("translates boom calls", function() {
    var code = ast('program { BOOM("asdasd") }');
    code.should.eql(
      program(s("Application", [
        s("Reference", "BOOM"),
        [s("MuString", "asdasd")]
      ]))
    );
  });

  it("translates a complete program", function() {
    var code = ast(`
      program {F(Verde) G(2,3) X(Este) y := f(False) }
      procedure F(x){ Poner(x) Poner(x) Poner(x) Sacar(x) }
      procedure G(n1,n2){ x := n1 z := n2 while(True){ x := n1} switch(dir) to { Sur -> {Poner(Verde)} Este -> {Poner(Verde)} Oeste -> {Poner(Verde)} Norte -> {Poner(Verde)}}}
      procedure X(dir){ Mover(dir) }
      function f(bool){ g := 2 if(False){ resultado := True} else { resultado := resultado} return (resultado)}`);

    code.should.not.eql(s("Other"));
  });

  it("translates an empty interactive program", function() {
    var code = ast("interactive program { }");

    code.should.eql(
      interactiveProgram(
        s("None")
      )
    );
  });

  it("translates a simple interactive program", function() {
    var code = ast("interactive program { K_ENTER -> { Poner(Rojo) ; Poner(Azul) } }");

    code.should.eql(
      interactiveProgram(
        s("EntryPoint", [
          "onKEnterPressed",
          s("Sequence", [
            s("Application", [s("Reference", "Poner"), [s("MuSymbol", "Rojo")]]),
            s("Application", [s("Reference", "Poner"), [s("MuSymbol", "Azul")]])
          ]),
        ])
      )
    );
  });

  it("translates a complex interactive program", function() {
    var code = ast("interactive program { K_ENTER -> { Poner(Rojo) ; Poner(Azul) } \r\n K_A -> { Poner(Verde) } }");

    code.should.eql(
      interactiveProgram(
        s("Sequence", [
          s("EntryPoint", [
            "onKEnterPressed",
            s("Sequence", [
              s("Application", [s("Reference", "Poner"), [s("MuSymbol", "Rojo")]]),
              s("Application", [s("Reference", "Poner"), [s("MuSymbol", "Azul")]])
            ]),
          ]),
          s("EntryPoint", [
            "onKAPressed",
            s("Sequence", [
              s("Application", [s("Reference", "Poner"), [s("MuSymbol", "Verde")]])
            ]),
          ])

        ])
      )
    );
  });
});
