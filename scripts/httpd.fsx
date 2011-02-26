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

let server processor =
  async{
    let listener = new TcpListener(IPAddress.Loopback, 80)
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

printfn "Listening on port 80. Press ESC to quit"
Async.Start(server fileserve)
while (Console.ReadKey(true).Key <> ConsoleKey.Escape) do ()
Async.CancelDefaultToken




