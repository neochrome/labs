#r "Microsoft.Xna.Framework.dll"
#r "Midi.dll"
open System
open Microsoft.Xna.Framework
open Microsoft.Xna.Framework.Input
open Midi

let selectMidi() =
  let mutable selected = None
  let mutable selecting = true
  while selecting && selected.IsNone do
    printfn "Choose MIDI out device:"
    let devices = OutputDevice.InstalledDevices
    devices |> Seq.iteri (fun i dev -> printfn "%d - %s" (i + 1) dev.Name)
    let input = Console.ReadKey(true)
    match Int32.TryParse (input.KeyChar.ToString()) with
    | true, number ->
      if devices.Count >= number && number > 0 then
        selected <- Some(devices.Item(number - 1))
    | _ -> if input.Key = ConsoleKey.Escape then selecting <- false
  selected

let escapeIsPressed() =
  Console.KeyAvailable && Console.ReadKey(true).Key = ConsoleKey.Escape

let executeUntil exitCondition what =
  Async.Start what
  while exitCondition() = false do
    System.Threading.Thread.Yield() |> ignore
  Async.CancelDefaultToken

let detectUntil exitCondition =
  let controllers = [PlayerIndex.One;PlayerIndex.Two;PlayerIndex.Three;PlayerIndex.Four]
  let mutable detected = None
  printfn "Press A-button (green) on controller to use"
  while detected.IsNone && exitCondition() = false do
    detected <- controllers |> Seq.tryFind (fun x -> GamePad.GetState(x).IsButtonDown(Buttons.A))
    System.Threading.Thread.Yield() |> ignore
  detected

let poll who onChange =
  async{
    let last = ref (new GamePadState())
    while true do
      let state = GamePad.GetState(who, GamePadDeadZone.None)
      if state.IsConnected && state.PacketNumber <> last.contents.PacketNumber then
        onChange (last.contents, state)
      if state.IsConnected = false then printfn "Reconnect!"
      last.contents <- state
      System.Threading.Thread.Yield() |> ignore
  }

type note = { channel: Channel; pitch: Pitch; velocity: int }

let trigger on pitch (last:GamePadState, state:GamePadState) =
  let (lastButton, _) = on last
  let (button, velocity) = on state
  if lastButton = ButtonState.Released && button = ButtonState.Pressed then
    printfn "%A - %A" pitch velocity
    Some({
          channel = Channel.Channel1;
          velocity = (match velocity with Some(amount) -> (int)(127.0f * amount) | None -> 127);
          pitch = pitch
         })
  else
    None

let map mappings state =
  mappings |> Seq.map (fun mapping -> mapping state) |> Seq.choose (fun m -> m)

let send (device:OutputDevice) (clock:Clock) (notes:seq<note>) =
  notes
  |> Seq.map (fun n -> new NoteOnOffMessage(device, n.channel, n.pitch, n.velocity, clock.Time, clock, 2.5f))
  |> Seq.iter clock.Schedule

let normalize (value:float32) = 
  (value + 1.0f) / 2.0f

let drums =
  [
    trigger (fun x -> (x.Buttons.LeftShoulder, Some(normalize x.ThumbSticks.Right.Y))) Pitch.C2;  // pedal
    trigger (fun x -> (x.Buttons.B, Some(normalize x.ThumbSticks.Left.Y))) Pitch.CSharp2;         // red
    trigger (fun x -> (x.Buttons.Y, None)) Pitch.D2;                                              // yellow
    trigger (fun x -> (x.Buttons.RightShoulder, None)) Pitch.DSharp2;                             // orange
    trigger (fun x -> (x.Buttons.X, Some(normalize x.ThumbSticks.Right.X))) Pitch.E2;             // blue
    trigger (fun x -> (x.Buttons.A, None)) Pitch.F2                                               // green
  ]


printfn "XNA -> MIDI"
printfn "Press Escape to quit"

let midiOut = selectMidi()
if midiOut.IsSome then
  printfn "%s selected" midiOut.Value.Name
  midiOut.Value.Open()
  let clock = new Clock(120.0f)
  clock.Start()

  let controllerIn = detectUntil escapeIsPressed
  if controllerIn.IsSome then
    printfn "Using controller: %A" controllerIn.Value
    poll controllerIn.Value (fun states -> states |> map drums |> send midiOut.Value clock)
    |> executeUntil escapeIsPressed |> ignore

  clock.Stop()
  midiOut.Value.Close()