using System;
using System.Linq;
using System.ServiceProcess;
using System.Threading;
using System.Diagnostics;
using System.Collections.Generic;

namespace Xrv
{
    public class Program
    {
        static void Main(string[] args)
        {
            if (args.Length == 0)
            {
                Console.Error.WriteLine("Missing command to execute!");
                return;
            }

            var service = new ApplicationService(args.First(), args.Skip(1));

            if (Environment.UserInteractive)
            {
                service.Start();
                Console.WriteLine("Started, press Ctrl+C to quit.");

                var cancelled = new ManualResetEvent(false);
                Console.CancelKeyPress += (s, a) => { a.Cancel = true; cancelled.Set(); };

                var exited = new ManualResetEvent(false);
                service.ApplicationExited += (s, a) =>
                {
                    Console.WriteLine("Application exited");
                    exited.Set();
                };

                WaitHandle.WaitAny(new[] { cancelled, exited });
                service.Stop();
                Console.WriteLine("Stopped");
            }
            else
                ServiceBase.Run(service);
        }
    }

    public class ApplicationService : ServiceBase
    {
        public ApplicationService(string filename, IEnumerable<string> args)
        {
            ServiceName = "Xrv";
            ApplicationExited += (s, a) => { };

            application = new Process
            {
                StartInfo = new ProcessStartInfo {
                    FileName = filename,
                    Arguments = string.Join(" ", args.ToArray()),
                    //CreateNoWindow = true, 
                    //WindowStyle = ProcessWindowStyle.Hidden,
                },
                EnableRaisingEvents = true
            };
            application.Exited += (s, a) => ApplicationExited(this, new EventArgs());
        }

        public event EventHandler ApplicationExited;

        public void Start()
        {
            OnStart(new string[] { });
        }

        protected override void OnStart(string[] args)
        {
            application.Start();
        }

        protected override void OnStop()
        {
            if (application.HasExited)
                return;
            // try sending ctrl+c/break and wait a short while first?
            application.Kill();
        }

        private Process application;
    }
}
