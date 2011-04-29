// client -> server
// {command: 'Hello', type: 'FireFox', agent: 'whatever' }
// {command: 'Bye' }
// {command: 'SetPage', page: 'title', url: 'http://....' }

// server -> client
// { command:'DoRefresh', files: [{action:'changed', path1:'some/path/some.file.js', path2:''}] }
// { command:'AboutMe', agent: 'blah', version: '1.0' }


open System
open System.IO
open System.Net
open System.Net.Sockets


let listenTo port processor =
    async{
        let listener = new TcpListener(IPAddress.Loopback, port)
        listener.Start()
        while true do
            let client = listener.AcceptTcpClient()
            using
                (new StreamReader(client.GetStream()))
                (fun reader -> processor reader (client.GetStream()))
    }

let server port processor =
  printfn "Listening on port %d. Press ESC to quit" port
  Async.Start(listenTo port processor)
  while (Console.ReadKey(true).Key <> ConsoleKey.Escape) do ()
  Async.CancelDefaultToken


let separator = "---XREFRESH-MESSAGE---"


let watch folder changed =
    async{
        printfn "watching: %s" Environment.CurrentDirectory
        using (new FileSystemWatcher(Environment.CurrentDirectory)) (fun fw ->
            
          fw.Changed.Add(fun args ->
            printfn "changed: %s" args.Name
            changed args.Name
          )
          fw.
          fw.EnableRaisingEvents <- true
        )
    }