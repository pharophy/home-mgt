@echo off
setlocal
if not exist tmp-codex mkdir tmp-codex
if exist tmp-codex\e2e-server-data.json del /f /q tmp-codex\e2e-server-data.json
set PORT=3211
set DATA_FILE=tmp-codex\e2e-server-data.json
node server\dist\index.js
