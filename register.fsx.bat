@echo off
assoc .fsx=FSharpScript
ftype FSharpScript="%programfiles%\Microsoft F#\v4.0\fsi.exe" "%%0" %%*
setx PATHEXT .fsx;%PATHEXT%