using System;

namespace xrv.testapp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("TestApp started with args:");
            Console.WriteLine(string.Join(", ", args));
            Console.WriteLine("Press ESC or Ctrl+C to quit");
            Console.CancelKeyPress += (s, a) => Console.WriteLine("Got Ctrl+C, goodbye!");
            while (Console.ReadKey(true).Key != ConsoleKey.Escape) ;
            Console.WriteLine("Got ESC, goodbye!");
        }
    }
}
