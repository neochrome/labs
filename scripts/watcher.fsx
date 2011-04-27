// client -> server
// {command: 'Hello', type: 'FireFox', agent: 'whatever' }
// {command: 'Bye' }
// {command: 'SetPage', page: 'title', url: 'http://....' }

// server -> client
// { command:'DoRefresh', files: [{action:'changed', path1:'some/path/some.file.js'}] }
// { command:'AboutMe', agent: 'blah', version: '1.0' }



printfn "watching: %s\npress any key to exit" System.Environment.CurrentDirectory
using (new System.IO.FileSystemWatcher(System.Environment.CurrentDirectory)) (fun fw ->
  fw.Changed.Add(fun args -> printfn "changed: %s" args.Name)
  fw.EnableRaisingEvents <- true
  System.Console.ReadKey(true);
)