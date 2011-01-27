open System
open System.IO

let toSet (values:string) = values.Split([|Path.PathSeparator|], StringSplitOptions.RemoveEmptyEntries) |> Set.ofArray
let fromSet (values:seq<string>) = String.Join(Path.PathSeparator.ToString(), values)

let modify how env =
  let path =
    Environment.GetEnvironmentVariable("PATH", env)
    |> (fun value -> if value = null then String.Empty else value) 
    |> toSet |> how |> fromSet
  Environment.SetEnvironmentVariable("PATH", path, env)

let pickWithDefault what defaultValue from =
  if from |> Seq.exists (fun x -> Option.isSome(what x))
  then from |> Seq.pick what
  else defaultValue

let usage message =
  printfn "%s" message
  printfn "Usage:"
  printfn "mpath COMMAND [DIRECTORY] [ENVIRONMENT]"
  printfn ""
  printfn "Valid values of COMMAND:"
  printfn "add    - adds DIRECTORY to the path of ENVIRONMENT"
  printfn "remove - removes DIRECTORY from path of ENVIRONMENT"
  printfn ""
  printfn "DIRECTORY will be added to/removed from the path environment."
  printfn "If not specified, the current working directory is used."
  printfn ""
  printfn "ENVIRONMENT is an optional value from:"
  printfn "--process - current process"
  printfn "--user    - current user and processes own by that user (default)"
  printfn "--machine - shared by all users and processes"
  exit(1)

let envFromArg = function
  | "--user" -> Some(EnvironmentVariableTarget.User)
  | "--machine" -> Some(EnvironmentVariableTarget.Machine)
  | "--process" -> Some(EnvironmentVariableTarget.Process)
  | _ -> None

let dirFromArg (arg:string) =
  if arg.Length > 0 && not(arg.StartsWith("--")) then
    try
      Some(Path.GetFullPath(arg))
    with
    | _ -> None
  else None  

printfn "mpath v0.1\n"
let args = fsi.CommandLineArgs
if args.Length < 2 || args.Length > 4 then
  usage "Wrong number of arguments."

let optionals = args |> Seq.skip 2
let dir = optionals |> pickWithDefault dirFromArg Environment.CurrentDirectory
let env = optionals |> pickWithDefault envFromArg EnvironmentVariableTarget.User

try
  match args.[1] with
  | "add" ->
    printfn "Adding '%s' to PATH for %s" dir (env.ToString())
    modify (fun path -> path.Add dir) env
  | "remove" ->
    printfn "Removing '%s' from PATH for %s" dir (env.ToString())
    modify (fun path -> path.Remove dir) env
  | cmd -> usage(sprintf "Invalid command: %s" cmd)
  printfn "Done."
with
| ex -> eprintfn "Error: %s" ex.Message
