$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot

$nodeInstallRoot = "C:\Program Files\nodejs"
$npmCommandPath = "C:\Program Files\nodejs\npm.cmd"

if (-not (Test-Path -LiteralPath $npmCommandPath)) {
  $npmCommand = Get-Command npm.cmd -ErrorAction Stop
  $npmCommandPath = $npmCommand.Source
}

if (Test-Path -LiteralPath $nodeInstallRoot) {
  $env:Path = "$nodeInstallRoot;$env:Path"
}

Start-Process -WindowStyle Hidden -FilePath $npmCommandPath -ArgumentList @("run", "start", "--workspace", "server") -WorkingDirectory $repoRoot | Out-Null
