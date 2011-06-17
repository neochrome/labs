@echo off
node tools/jasmine-node/cli.js --color src
tools\jsl.exe conf tools\jsl.default.conf -nologo -nofilelisting +recurse -process src/*.js
