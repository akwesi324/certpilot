<#
.SYNOPSIS
    Builds the CertPilot Android app into a signed APK with the Android SDK tools directly
    (aapt2 -> javac -> d8 -> zipalign -> apksigner). No Gradle or Android Studio.

.DESCRIPTION
    Needs JDK 21 and Android SDK build-tools 35 / platform 35. The script looks in
    %LOCALAPPDATA%\CertPilot\android and %LOCALAPPDATA%\SecurityLabs\android, or set
    $env:ANDROID_TOOLCHAIN to a folder containing jdk\ and sdk\.

    -ServerUrl builds the server address in (e.g. https://certpilot.vercel.app). Without it the
    app asks for the address on first launch.

    The signing key is created on the first build in %LOCALAPPDATA%\CertPilot\android\signing
    (outside the repo); its password is stored DPAPI-encrypted for your Windows account. Keep it:
    Android only installs updates signed with the same key.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\android\build-apk.ps1 -ServerUrl https://certpilot.vercel.app
#>
[CmdletBinding()]
param(
    [string]$VersionName = '1.0.0',
    [int]$VersionCode = 1,
    [string]$ServerUrl = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Own = Join-Path $env:LOCALAPPDATA 'CertPilot\android'
$candidates = @($env:ANDROID_TOOLCHAIN, $Own, (Join-Path $env:LOCALAPPDATA 'SecurityLabs\android')) | Where-Object { $_ }
$ToolRoot = $candidates | Where-Object { Test-Path (Join-Path $_ 'jdk\bin\javac.exe') } | Select-Object -First 1
if (-not $ToolRoot) { throw 'No Android toolchain found (JDK 21 + SDK build-tools 35). Set $env:ANDROID_TOOLCHAIN.' }
$Jdk        = Join-Path $ToolRoot 'jdk'
$BuildTools = Join-Path $ToolRoot 'sdk\build-tools\35.0.0'
$AndroidJar = Join-Path $ToolRoot 'sdk\platforms\android-35\android.jar'
$SigningDir = Join-Path $Own 'signing'
$Keystore   = Join-Path $SigningDir 'certpilot.jks'
$KsPassFile = Join-Path $SigningDir 'keystore-password.dpapi'

$App   = $PSScriptRoot
$Build = Join-Path $PSScriptRoot 'build'
$Dist  = Join-Path $PSScriptRoot 'dist'
$MinSdk = 26
$TargetSdk = 35

function Write-Step([string]$m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Write-Ok([string]$m)   { Write-Host "    [OK]   $m" -ForegroundColor Green }
function Invoke-Tool([string]$Exe, [string[]]$Arguments) {
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { $out = & $Exe @Arguments 2>&1 | ForEach-Object { "$_" } } finally { $ErrorActionPreference = $previous }
    if ($LASTEXITCODE -ne 0) { throw "$(Split-Path $Exe -Leaf) failed (exit $LASTEXITCODE):`n$(($out | Select-Object -Last 25) -join "`n")" }
    return $out
}

foreach ($p in @($BuildTools, $AndroidJar)) { if (-not (Test-Path $p)) { throw "Missing $p" } }
if ($ServerUrl -and $ServerUrl -notmatch '^https://') { throw 'ServerUrl must start with https://' }
$env:JAVA_HOME = $Jdk
$env:Path = "$Jdk\bin;$env:Path"
$aapt2 = Join-Path $BuildTools 'aapt2.exe'; $d8 = Join-Path $BuildTools 'd8.bat'
$zipalign = Join-Path $BuildTools 'zipalign.exe'; $apksigner = Join-Path $BuildTools 'apksigner.bat'
Write-Host "Toolchain: $ToolRoot"

# Version and server address into BuildConfigInfo (restored afterwards so the repo stays clean).
$cfgFile = Join-Path $App 'java\com\maskedops\certpilot\BuildConfigInfo.java'
$cfgOriginal = [IO.File]::ReadAllText($cfgFile)
$cfg = [regex]::Replace($cfgOriginal, 'VERSION = "[^"]*"', "VERSION = `"$VersionName`"")
$cfg = [regex]::Replace($cfg, 'SERVER_URL = "[^"]*"', "SERVER_URL = `"$($ServerUrl.TrimEnd('/'))`"")
[IO.File]::WriteAllText($cfgFile, $cfg, (New-Object Text.UTF8Encoding $false))

try {
    if (Test-Path $Build) { Remove-Item $Build -Recurse -Force }
    New-Item -ItemType Directory -Force -Path $Build, $Dist, "$Build\gen", "$Build\classes", "$Build\dex" | Out-Null

    Write-Step 'Resources (aapt2)'
    Invoke-Tool $aapt2 @('compile', '--dir', (Join-Path $App 'res'), '-o', "$Build\res.zip") | Out-Null
    Invoke-Tool $aapt2 @('link', '-I', $AndroidJar, '--manifest', (Join-Path $App 'AndroidManifest.xml'),
        '-R', "$Build\res.zip", '--java', "$Build\gen", '--auto-add-overlay',
        '--min-sdk-version', "$MinSdk", '--target-sdk-version', "$TargetSdk",
        '--version-code', "$VersionCode", '--version-name', $VersionName, '-o', "$Build\app-res.apk") | Out-Null
    Write-Ok 'linked'

    Write-Step 'Java (javac) and dex (d8)'
    $sources = @(Get-ChildItem (Join-Path $App 'java'), "$Build\gen" -Recurse -Filter '*.java' | ForEach-Object { $_.FullName })
    Invoke-Tool (Join-Path $Jdk 'bin\javac.exe') (@('--release', '11', '-encoding', 'UTF-8', '-nowarn', '-Xlint:-options',
        '-classpath', $AndroidJar, '-d', "$Build\classes") + $sources) | Out-Null
    $classes = @(Get-ChildItem "$Build\classes" -Recurse -Filter '*.class' | ForEach-Object { $_.FullName })
    Invoke-Tool $d8 (@('--release', '--min-api', "$MinSdk", '--lib', $AndroidJar, '--output', "$Build\dex") + $classes) | Out-Null
    Write-Ok "$($sources.Count) source files"
} finally {
    [IO.File]::WriteAllText($cfgFile, $cfgOriginal, (New-Object Text.UTF8Encoding $false))
}

Write-Step 'Package'
$unaligned = "$Build\app-unaligned.apk"
Copy-Item "$Build\app-res.apk" $unaligned
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::Open($unaligned, [IO.Compression.ZipArchiveMode]::Update)
try { [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "$Build\dex\classes.dex", 'classes.dex', [IO.Compression.CompressionLevel]::Optimal) }
finally { $zip.Dispose() }
$aligned = "$Build\app-aligned.apk"
Invoke-Tool $zipalign @('-f', '-p', '4', $unaligned, $aligned) | Out-Null

Write-Step 'Sign'
New-Item -ItemType Directory -Force -Path $SigningDir | Out-Null
if (-not (Test-Path $Keystore)) {
    $bytes = New-Object byte[] 24
    (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
    $pw = [Convert]::ToBase64String($bytes)
    ConvertTo-SecureString $pw -AsPlainText -Force | ConvertFrom-SecureString | Set-Content -Path $KsPassFile -Encoding ASCII
    $env:CP_KS_PASS = $pw
    Invoke-Tool (Join-Path $Jdk 'bin\keytool.exe') @('-genkeypair', '-keystore', $Keystore, '-storetype', 'PKCS12', '-alias', 'certpilot',
        '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000', '-dname', 'CN=CertPilot, O=MaskedOps', '-storepass:env', 'CP_KS_PASS') | Out-Null
    Write-Ok "Created signing key $Keystore (back it up)"
} else {
    $secure = Get-Content $KsPassFile | ConvertTo-SecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $env:CP_KS_PASS = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}
$apk = Join-Path $Dist "CertPilot-$VersionName.apk"
try {
    Invoke-Tool $apksigner @('sign', '--ks', $Keystore, '--ks-key-alias', 'certpilot', '--ks-pass', 'env:CP_KS_PASS', '--min-sdk-version', "$MinSdk", '--out', $apk, $aligned) | Out-Null
} finally { Remove-Item Env:\CP_KS_PASS -ErrorAction SilentlyContinue }
Invoke-Tool $apksigner @('verify', $apk) | Out-Null

$badging = Invoke-Tool $aapt2 @('dump', 'badging', $apk)
Write-Host "`n$(($badging | Where-Object { $_ -match '^package:' }) -replace '\s*platformBuildVersion.*', '')" -ForegroundColor Green
Write-Host ("APK: {0}  ({1:N0} KB, SHA-256 {2})" -f $apk, ((Get-Item $apk).Length / 1KB), (Get-FileHash $apk -Algorithm SHA256).Hash.ToLower()) -ForegroundColor Green
Write-Host $(if ($ServerUrl) { "Server: $ServerUrl" } else { 'Server: asked on first launch' })
