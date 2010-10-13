#load "cards.fsx"
open Cards
let cdr = { token = "<your-ap-token>"; id = 123456 }
let cards = cards_for (Stories.Current.from cdr)

using (System.IO.File.CreateText("cards.html")) cards.write
