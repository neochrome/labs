open System
open System.IO
open System.Net
open System.Xml
open System.Xml.Xsl

let transform (source:XmlReader) (how:XmlReader) (output:XmlWriter) (properties:seq<string*string>) =
  let xslt = new XslCompiledTransform()
  xslt.Load(how)
  let args = Seq.fold (fun (acc:XsltArgumentList) (name,value) -> acc.AddParam(name, "", value);acc) (new XsltArgumentList()) properties
  xslt.Transform(source, args, output)

let usage(message) = 
  printfn "%s\nUsage:\n%s <source.xml> <transform.xslt> <output.xml>" fsi.CommandLineArgs.[0] message
  exit 1

let args = fsi.CommandLineArgs
if args.Length <> 4 then usage("Invalid number of arguments")

using (XmlTextReader.Create(args.[1])) (fun source ->
  using (XmlTextReader.Create(args.[2])) (fun how ->
    let settings = new XmlWriterSettings()
    settings.Indent <- true
    settings.IndentChars <- "\t"
    using (XmlTextWriter.Create(args.[3], settings)) (fun output ->
      transform source how output Seq.empty
    )
  )
)
