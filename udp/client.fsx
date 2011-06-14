open System
open System.Net
open System.Net.Sockets
open System.Text

let monitor =
  async{
    using
      (new UdpClient(new IPEndPoint(IPAddress.Any, 11000)))
      (fun client ->
        while true do
          let ep : IPEndPoint ref = ref null
          let text = Encoding.UTF8.GetString(client.Receive(ep))
          printfn "received: %s" text
      )
  }

printfn "Press ESC to quit"
Async.Start(monitor)
while (Console.ReadKey(true).Key <> ConsoleKey.Escape) do ()
Async.CancelDefaultToken
