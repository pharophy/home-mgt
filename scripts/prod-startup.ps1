$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot

$npmCommand = Get-Command npm.cmd -ErrorAction Stop
Start-Process -WindowStyle Hidden -FilePath $npmCommand.Source -ArgumentList @("run", "prod") -WorkingDirectory $repoRoot | Out-Null
