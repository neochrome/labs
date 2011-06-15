open System
#load @"fspec.fsx"

describe "spec" <| fun()->
  context "when executed" <| fun()->
    it "should succeed" <| fun()->
      ()
  
    it "should fail" <| fun()->
      fail()
  
    it "should epic fail" <| fun()->
      failwith "epic failure"
  
    it "should be pending" <| fun()->
      pending "since I said so"
  
describe "be: tests equality for" <| fun()->
  it "numbers" <| fun()->
    1 |> should be 1
  it "text" <| fun()->
    "one" |> should be "one"
  it "instances" <| fun()->
    let one = new Object()
    one |> should be one

describe "not_be: tests equality for" <| fun()->
  it "numbers" <| fun()->
    1 |> should not_be 2
  it "text" <| fun()->
    "one" |> should not_be "two"
  it "instances" <| fun()->
    let one = new Object()
    let other = new Object()
    one |> should not_be other

describe "row input" <| fun()->
  [2; 4; 6; 8]
  |> for_all "test %d" <| fun x ->
      x % 2 |> should be 0
  ['a';'b';'c']
  |> for_all "test %c" <| fun x ->
      x |> should be x
  ["apple";"banana";"clementine"]
  |> for_all "test %s" <| fun x ->
      x |> should be x
  [(1,1,2);(1,2,3)]
  |> for_all "test %A" <| fun (a,b,c) ->
      a + b |> should be c
