[<AutoOpen>]
module Fspec
open System
exception private Fail
exception private Pending of string

let private verifyBehaviour description behaviour =
  try
    behaviour()
    printfn "  - %s" description
  with
  | Fail -> printfn "F - %s" description
  | Pending(why) -> printfn "P - %s (%s)" description why
  | epic -> printfn "E - %s (%s)" description epic.Message

let describe something behaves =
  printfn "%s: " something
  behaves()
  printfn ""

let it should behave =
  verifyBehaviour should behave

//let private format how what =
//  let (|Int|_|) what =
//    if Int32.


let for_all should args behave = 
  args |> Seq.iter (fun arg ->
    let shouldText = System.String.Format(should, [arg])
    verifyBehaviour shouldText (fun () -> behave arg)
  )

let pending why = raise(Pending(why))
let fail() = raise(Fail)
let private verify expectation = if not expectation then fail()
let should what = what
let be expected actual = verify (actual = expected)
let not_be expected actual = verify (actual <> expected)
