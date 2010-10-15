@echo off
setlocal
if $"%ProgramW6432%" == $ set base=%ProgramFiles%
if $"%ProgramW6432%" neq $ set base=%ProgramFiles(x86)%
assoc .fsx=FSharpScript
ftype FSharpScript="%base%\Microsoft F#\v4.0\fsi.exe" "%%0" %%*
setx PATHEXT .fsx;%PATHEXT%