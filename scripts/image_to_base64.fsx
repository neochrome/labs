let fileName = fsi.CommandLineArgs.[1]
let mimeType = "image/" + System.IO.Path.GetExtension(fileName).ToLower()
printfn "data:%s;base64,%s" mimeType (System.Convert.ToBase64String(System.IO.File.ReadAllBytes(fileName)))
