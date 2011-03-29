open System
open System.IO
open System.Net
open System.Net.Sockets

let (|Grep|_|) expr input =
  let r = System.Text.RegularExpressions.Regex.Match(input, expr)
  if r.Success then
    Some([for g in r.Groups -> g.Value].Tail)
  else
    None

let server port processor =
  async{
    let listener = new TcpListener(IPAddress.Loopback, port)
    listener.Start()
    while true do
      let client = listener.AcceptTcpClient()
      using
        (new StreamReader(client.GetStream()))
        (fun reader ->
          processor reader (client.GetStream())
        )
  }

let fileserve (request: StreamReader) (response: NetworkStream) =
  let raw = request.ReadLine()
  printfn "%s" raw
  match raw with
  | Grep(@"GET /(.*) HTTP") resource ->
    if File.Exists(resource.Head) then
      let content = File.ReadAllBytes(resource.Head)
      response.Write(content, 0, content.Length)
      response.Flush()
  | _ -> printfn "unknown request"



let start port =
  printfn "Listening on port %d. Press ESC to quit" port
  Async.Start(server port fileserve)
  while (Console.ReadKey(true).Key <> ConsoleKey.Escape) do ()
  Async.CancelDefaultToken


let args = (fsi.CommandLineArgs |> Array.toList).Tail
if args.IsEmpty then
  start 8080
else
  start (Int32.Parse(args.Head))
