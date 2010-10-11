#load @"..\fake\fake.fsx"

let v = new System.Version(0,0,1,0);
//System.Reflection.Assembly.LoadFrom(@"bin\xrv.exe").FullName
//|> System.Version.Parse

build("xrv.sln") && package(@"bin\xrv.v" + v.ToString(4) + ".zip", [@"bin\xrv.exe"])
