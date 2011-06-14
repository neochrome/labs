[<AutoOpen>]
module Udp
open System
open System.Net
open System.Net.Sockets
open System.Text

type UdpClient with
  member this.AsyncSend(what:string, ep:IPEndPoint) =
    let data = Encoding.UTF8.GetBytes(what)
    Async.FromBeginEnd(
      (fun (callback, state) -> this.BeginSend(data, data.Length, ep, callback, state)),
      this.EndSend
    )
  member this.AsyncBroadcast(what, port) =
    this.AsyncSend(what, new IPEndPoint(IPAddress.Broadcast, port))

  member this.AsyncRead() =
    Async.FromBeginEnd(
      (fun (callback, state) -> this.BeginReceive(callback, state)),
      (fun result ->
        let ep : IPEndPoint ref = ref null
        Encoding.UTF8.GetString(this.EndReceive(result, ep))
      )
    )