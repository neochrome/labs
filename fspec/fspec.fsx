[<AutoOpen>]
module Fspec
open System

exception private Fail
exception private Pending of string

let cprintfn color =
   Printf.kprintf (fun text ->
      try
         Console.ForegroundColor <- color
         Console.WriteLine(text)
      finally
         Console.ResetColor()
   )

let private verify_example implementation description =
   try
      implementation()
      cprintfn ConsoleColor.Green " - %s" description
   with
   | Pending(why) -> cprintfn ConsoleColor.DarkGray " - %s (%s)" description why
   | Fail         -> cprintfn ConsoleColor.Red      " - %s"      description
   | epic         -> cprintfn ConsoleColor.Red      " - %s (%s)" description epic.Message

let private group_of_examples description examples =
  printfn "%s:" description
  examples()
  printfn ""

let private one_example description implementation =
  description |> verify_example implementation

let private one_example_with_rows description rows implementation = 
  rows |> Seq.iter (fun row ->
    sprintf description row
    |> verify_example (fun () -> implementation row)
  )


// syntax
// description & context
let describe = group_of_examples
let context = group_of_examples
let it = one_example
let for_all = one_example_with_rows

// expectations
let pending why = raise(Pending(why))
let fail() = raise(Fail)
let private verify_expectation expectation = if not expectation then fail()
let should expectation = expectation
let be expected actual = verify_expectation (actual = expected)
let not_be expected actual = verify_expectation (actual <> expected)
