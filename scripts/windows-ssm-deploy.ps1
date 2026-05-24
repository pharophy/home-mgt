param(
  [Parameter(Mandatory = $true)]
  [string]$ArtifactUrl,
  [Parameter(Mandatory = $true)]
  [string]$ReleaseId,
  [string]$AppRoot = "C:\HostingSpaces\starstep.blabberjax.com\app",
  [string]$SharedEnvironmentFile = ".env.prod",
  [string]$RuntimeEnvironmentFile = ".env",
  [string]$ScheduledTaskName = "HomeMgtProd"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$allowedEnvironmentKeys = @(
  "OPENAI_API_KEY",
  "PRESCHOOL_SQL_CONNECTION_STRING"
)

$nodeInstallRoot = "C:\Program Files\nodejs"
$nodeCommandPath = "C:\Program Files\nodejs\node.exe"
$npmCommandPath = "C:\Program Files\nodejs\npm.cmd"

if (-not (Test-Path -LiteralPath $nodeCommandPath)) {
  $nodeCommandPath = (Get-Command node -ErrorAction Stop).Source
}

if (-not (Test-Path -LiteralPath $npmCommandPath)) {
  $npmCommandPath = (Get-Command npm.cmd -ErrorAction Stop).Source
}

if (Test-Path -LiteralPath $nodeInstallRoot) {
  $env:Path = "$nodeInstallRoot;$env:Path"
}

function Invoke-NativeOrThrow {
  param(
    [string]$FilePath,
    [string[]]$ArgumentList
  )

  & $FilePath @ArgumentList

  if ($LASTEXITCODE -ne 0) {
    $exitCode = $LASTEXITCODE
    throw "Command failed with exit code ${exitCode}: $FilePath $($ArgumentList -join ' ')"
  }
}

$releasesRoot = Join-Path $AppRoot "releases"
$currentRoot = Join-Path $AppRoot "current"
$sharedRoot = Join-Path $AppRoot "shared"
$sharedEnvironmentPath = Join-Path $sharedRoot $SharedEnvironmentFile
$tempRoot = Join-Path $env:TEMP "starstep-deploy"
$artifactPath = Join-Path $tempRoot "$ReleaseId.zip"
$releaseRoot = Join-Path $releasesRoot $ReleaseId
$sharedGeneratedAssetRoot = Join-Path $sharedRoot "generated-assets"
$releaseGeneratedAssetRoot = Join-Path $releaseRoot "generated-assets"
$runtimeEnvironmentPath = Join-Path $releaseRoot $RuntimeEnvironmentFile

New-Item -ItemType Directory -Force -Path $releasesRoot | Out-Null
New-Item -ItemType Directory -Force -Path $sharedRoot | Out-Null
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

if (-not (Test-Path -LiteralPath $sharedEnvironmentPath)) {
  throw "Expected shared environment file at $sharedEnvironmentPath."
}

if (Test-Path -LiteralPath $releaseRoot) {
  Remove-Item -LiteralPath $releaseRoot -Recurse -Force
}

Invoke-WebRequest -UseBasicParsing -Uri $ArtifactUrl -OutFile $artifactPath
Expand-Archive -LiteralPath $artifactPath -DestinationPath $releaseRoot -Force

if (Test-Path -LiteralPath $releaseGeneratedAssetRoot) {
  $sharedGeneratedAssetHasContent = $false
  if (Test-Path -LiteralPath $sharedGeneratedAssetRoot) {
    $sharedGeneratedAssetHasContent = [bool](Get-ChildItem -LiteralPath $sharedGeneratedAssetRoot -Force | Select-Object -First 1)
  }

  if (-not $sharedGeneratedAssetHasContent) {
    New-Item -ItemType Directory -Force -Path $sharedGeneratedAssetRoot | Out-Null
    Copy-Item -Path (Join-Path $releaseGeneratedAssetRoot "*") -Destination $sharedGeneratedAssetRoot -Recurse -Force
  }
}

$runtimeEnvironmentLines = Get-Content -LiteralPath $sharedEnvironmentPath |
  Where-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#') -or -not $line.Contains('=')) {
      return $false
    }

    $key = ($line -split '=', 2)[0].Trim()
    return $allowedEnvironmentKeys -contains $key
  }

Set-Content -LiteralPath $runtimeEnvironmentPath -Value $runtimeEnvironmentLines

Push-Location -LiteralPath $releaseRoot
try {
  Invoke-NativeOrThrow -FilePath $npmCommandPath -ArgumentList @('ci', '--omit=dev')
  Invoke-NativeOrThrow -FilePath $nodeCommandPath -ArgumentList @('.\server\dist\scripts\run-migrations.js')
}
finally {
  Pop-Location
}

$taskExists = $true
& schtasks /Query /TN $ScheduledTaskName | Out-Null
if ($LASTEXITCODE -ne 0) {
  $taskExists = $false
}

if (-not $taskExists) {
  Push-Location -LiteralPath $currentRoot
  try {
    Invoke-NativeOrThrow -FilePath $nodeCommandPath -ArgumentList @('.\scripts\windows-prod-startup.mjs', 'install')
  }
  finally {
    Pop-Location
  }
}

& schtasks.exe /End /TN $ScheduledTaskName | Out-Null

$processes = Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -eq "node.exe" -and
    $_.CommandLine -and
    (
      $_.CommandLine.Contains($currentRoot) -or
      $_.CommandLine.Contains("dist/index.js") -or
      ($_.CommandLine.Contains("npm-cli.js") -and $_.CommandLine.Contains("run start --workspace server"))
    )
  }

foreach ($process in $processes) {
  Stop-Process -Id $process.ProcessId -Force
}

Start-Sleep -Seconds 2

if (Test-Path -LiteralPath $currentRoot) {
  Remove-Item -LiteralPath $currentRoot -Recurse -Force
}

Copy-Item -LiteralPath $releaseRoot -Destination $currentRoot -Recurse

Invoke-NativeOrThrow -FilePath 'schtasks.exe' -ArgumentList @('/Run', '/TN', $ScheduledTaskName)
