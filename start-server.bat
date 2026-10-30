@echo off
chcp 65001 >nul
cd /d "%~dp0"

if exist "C:\Program Files\nodejs\node.exe" (
  set "NODE_BIN=C:\Program Files\nodejs\node.exe"
) else (
  set "NODE_BIN=node"
)

start "" http://localhost:3000
"%NODE_BIN%" server.js
pause
