open System
open System.IO
open System.Net
open System.Net.Sockets
open System.Text

let watch folder changed =
  async{
    using
      (new FileSystemWatcher(folder))
      (fun fw ->
        fw.Changed.Add(fun args -> changed args.Name)
        fw.EnableRaisingEvents <- true
        while true do ()
    )
  }
  
let ep = new IPEndPoint(IPAddress.Broadcast, 11000)
using
  (new UdpClient())
  (fun client ->
    let broadcast (what:string) = 
      let data = Encoding.UTF8.GetBytes(what)
      client.Send(data, data.Length, ep)
      |> ignore

    Async.Start(
      watch Environment.CurrentDirectory (fun filename ->
        printfn "broadcast - changed: %s" filename
        broadcast filename
      )
    )

    printfn "press ESC to quit"
    while (Console.ReadKey(true).Key <> ConsoleKey.Escape) do ()
    printfn "bye, bye"
    Async.CancelDefaultToken
  )
