#load "lml/lml.fsx"
#r "System.Xml.Linq"
open System
open System.Net
open System.Xml.Linq

type String with member this.With([<System.ParamArray>]v) = String.Format(this, v)
let (!) (n:string) = XName.op_Implicit(n)
let (?) (elm: XElement) (name: string) : string = elm.Element(!name).Value
let (>>) (elm: XElement) (name: string) = elm.Descendants(!name)
let (@) (elm: XElement) (name: string) : string = elm.Attribute(!name).Value

let get (url:string) (headers:seq<string * string>) =
    use client = new WebClient()
    headers |> Seq.iter (fun (header,value) -> client.Headers.Add(header, value))
    client.DownloadString(url)

type Settings = { token: string; id: int }
type Card = { id: string; title: string; estimate: string; kind: string }

type Stories =
| Done
| Current
| Backlog
  override this.ToString() =
    match this with
    | Done -> "done"
    | Current -> "current"
    | Backlog -> "backlog"
  member this.from (settings: Settings) =
    let url = "http://www.pivotaltracker.com/services/v3/projects/{0}/iterations/{1}"
    let xml = get (url.With(settings.id, this.ToString())) [("X-TrackerToken", settings.token)]
    XDocument.Parse(xml).Root >> "story"
    |> Seq.map (fun story -> { id = story?id; title = story?name; kind = story?story_type; estimate = (if story?story_type = "feature" then story?estimate else "") })


let as_card story =
  T?a <- [
    &"{0} - {1}".With(story.id, story.title);
    "id"=>story.id;
    "rel"=>story.kind;
    "title"=>story.title;
    "rev"=>story.estimate;
  ]

let cards_for stories = 
  T?html <- [
    T?head <- [
      T?title <- "StoryCards";
      T?script <- ["src"=>"content/jquery.min.js";"type"=>"text/javascript"];
      T?script <- ["src"=>"content/cards.js";"type"=>"text/javascript"];
      T?link <- ["href"=>"content/cards.css";"type"=>"text/css";"rel"=>"stylesheet"];
    ];
    T?body <- [
      T?div <- [
        "id"=>"selection";
        T?button <- ["class"=>"print";&"print selected"];
      ] |> Seq.append (stories |> Seq.map as_card);
      T?div <- ["id"=>"for-printing"];
    ]
  ]
