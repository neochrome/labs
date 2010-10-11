[<AutoOpen>]
module Fake
#I __SOURCE_DIRECTORY__
#r "Ionic.Zip.Reduced.dll"
#r "ilmerge.exe"
open System
open System.IO
open System.Diagnostics
open Ionic.Zip
open ILMerging

/// ? - single wildcard character
/// * - zero or multiple wildcard characters
/// ** - any sub path
let glob(pattern:string) : list<string> =
    let segments = pattern.Split([|'/';'\\'|], StringSplitOptions.RemoveEmptyEntries) |> Array.toList
    let rec expand(path, parts) =
        match parts with
        | h::t ->
            if t.IsEmpty then
                Directory.EnumerateFiles(path, h)
                |> Seq.map(fun f -> f.Replace(Environment.CurrentDirectory, "").TrimStart([|'/';'\\'|]))
                |> Seq.toList
            else
                Directory.EnumerateDirectories(path, h, if h = "**" then SearchOption.AllDirectories else SearchOption.TopDirectoryOnly)
                |> Seq.collect(fun p -> expand(p, t))
                |> Seq.toList
        | [] -> []
    expand(Environment.CurrentDirectory, segments)

let exec(fileName:string, arguments:string) =
    let command =
        Process.Start(
            ProcessStartInfo(
                FileName = fileName,
                Arguments = arguments,
                UseShellExecute = false))
    command.WaitForExit()
    command.ExitCode

let build(solutionName:string) : bool =
    printfn "Building: %s" solutionName
    let fxPath = System.Runtime.InteropServices.RuntimeEnvironment.GetRuntimeDirectory()  
    let msBuild4 = Path.Combine(fxPath, @"..\v4.0.30319\MSBuild.exe")
    exec(msBuild4, solutionName + " /nologo /m /p:Configuration=Release") = 0

let merge(outputType:ILMerge.Kind, output:string, files:seq<string>) : bool =
    printfn "Merging: %s from:\n%A" output files
    let cmd = ILMerge()
    cmd.OutputFile <- output
    cmd.SetInputAssemblies(Seq.toArray files)
    cmd.TargetKind <- outputType
    cmd.DebugInfo <- false
    cmd.Merge()
    true

let merge_exe(output, files) = merge(ILMerge.Kind.Exe, output, files)
let merge_dll(output, files) = merge(ILMerge.Kind.Dll, output, files)
let merge_winexe(output, files) = merge(ILMerge.Kind.WinExe, output, files)

let packageWithPaths(archiveName:string,files:seq<string>,keepFolders:bool) : bool =
    printfn "Packaging: %s" archiveName
    use zip = new ZipFile()
    files
    |> Seq.map(fun f -> (f, if keepFolders then f else ""))
    |> Seq.iter(fun (f, af) -> printfn "Adding: %s" f;zip.AddFile(f, af) |> ignore)
    zip.Save(archiveName)
    true

let package(archiveName:string,files:seq<string>) : bool = packageWithPaths(archiveName,files,false)
