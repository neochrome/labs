@echo off
tools\jsl.exe conf tools\jsl.default.conf -nofilelisting +recurse -process src/*.js
node tools/jasmine-node/cli.js --color src
