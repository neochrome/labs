[<AutoOpen>]
module Fspec
open System

type String with
  member this.FormatWith([<ParamArray>] args: Object[]) =
    String.Format(this, args)

exception private Fail
exception private Pending of string

let private verify_example implementation description =
  try
    implementation()
    printfn "  - %s" description
  with
  | Fail -> printfn "F - %s" description
  | Pending(why) -> printfn "P - %s (%s)" description why
  | epic -> printfn "E - %s (%s)" description epic.Message

let private group_of_examples description examples =
  printfn "%s: " description
  examples()
  printfn ""

let private one_example description implementation =
  description |> verify_example implementation

let private one_example_with_rows (description:string) rows implementation = 
  rows |> Seq.iter (fun row ->
    description.FormatWith(row :> Object)
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
