open System
open System.Security
open System.Security.Cryptography

let rng = new RNGCryptoServiceProvider()
let buffer = Array.create 32 0uy
Console.WriteLine buffer.Length
rng.GetBytes(buffer)
buffer |> Array.iter (fun b -> Console.Write("{0:X2}", b))
