open System
open System.Net
open System.Net.Sockets
open System.Text

let ep = new IPEndPoint(IPAddress.Broadcast, 11000)
printfn "Type exit to quit"
using
  (new UdpClient())
  (fun client ->
    let broadcast what = 
      printfn "sending: %s" what
      let data = Encoding.UTF8.GetBytes(what)
      client.Send(data, data.Length, ep)
      |> ignore

    let mutable running = true
    while running do
      let text = Console.ReadLine()
      broadcast text
      if text = "exit" then running <- false
  )
