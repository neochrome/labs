open System
open System.IO
open System.Net
open System.Xml
open System.Xml.Xsl

type String with member this.With([<System.ParamArray>]v) = String.Format(this, v)

let get (url:string) (headers:seq<string * string>) =
    use client = new WebClient()
    headers |> Seq.iter (fun (header,value) -> client.Headers.Add(header, value))
    client.DownloadString(url)

let usage(message) = 
  printfn "%s\nUsage:\ncards <token> <projectid> <done|current|backlog>" message
  exit 1

let args = fsi.CommandLineArgs
if args.Length <> 4 then usage("Invalid number of arguments")

let token = args.[1]

let projectId =
  match Int32.TryParse(args.[2]) with
  | (true, n) -> n
  | _ -> usage(sprintf "ProjectId must be numerical: %s" args.[2])

let iteration =
  match args.[3] with
  | "done" | "current" | "backlog" -> args.[3]
  | _ -> usage(sprintf "Invalid iteration: %s" args.[3])

let xml = get ("http://www.pivotaltracker.com/services/v3/projects/{0}/iterations/{1}".With(projectId, iteration)) [("X-TrackerToken", token)]
let xslt = new XslCompiledTransform()
xslt.Load("cards.xslt")
let xsltArgs = new XsltArgumentList()
xsltArgs.AddParam("iteration", "", iteration)
using (XmlTextReader.Create(new StringReader(xml))) (fun reader -> xslt.Transform(reader, xsltArgs, Console.Out))