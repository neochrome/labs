open System
open System.IO
open System.Net
open System.Xml
open System.Xml.Xsl

let get (url:string) (headers:seq<string * string>) =
    use client = new WebClient()
    headers |> Seq.iter client.Headers.Add
    client.DownloadString(url)

let usage(message) = 
  printfn "%s\nUsage:\ncards <token> <projectid> <done|current|backlog>" message
  exit 1

let args = fsi.CommandLineArgs
if args.Length <> 4 then usage("Invalid number of arguments")

let token = [("X-TrackerToken", args.[1])]

let projectId =
  match Int32.TryParse(args.[2]) with
  | (true, n) -> n
  | _ -> usage(sprintf "ProjectId must be numerical: %s" args.[2])

let iteration =
  match args.[3] with
  | "done" | "current" | "backlog" -> args.[3]
  | _ -> usage(sprintf "Invalid iteration: %s" args.[3])

let url = sprintf "http://www.pivotaltracker.com/services/v3/projects/%d/iterations/%s" projectId iteration

using (XmlTextReader.Create(new StringReader(get url token))) (fun reader -> 
  let xslt = new XslCompiledTransform()
  xslt.Load("cards.xslt")
  let args = new XsltArgumentList()
  args.AddParam("iteration", "", iteration)
  xslt.Transform(reader, args, Console.Out))