<#
.SYNOPSIS
    JanDrishti Supabase Production Database Resilient Import Runner
    Executes all remaining import stages (Chunks 07 to 13) with automated transaction sub-batching,
    pre-execution remote checks, retry on connection loss, and stage-by-stage verification.

.DESCRIPTION
    Safely imports:
      - Infrastructure Works Part 4 & 5 (40,975 rows -> 102,437 total)
      - Treasury Disbursement Vouchers (82,296 rows total)
      - Governance Cases, Audit Trail & ML Anomaly Signals (2,028 rows total)

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\import_remaining_supabase.ps1
    powershell -ExecutionPolicy Bypass -File .\scripts\import_remaining_supabase.ps1 -VerifyOnly
    powershell -ExecutionPolicy Bypass -File .\scripts\import_remaining_supabase.ps1 -DryRun
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$HostName = "aws-0-ap-northeast-1.pooler.supabase.com",

    [Parameter(Mandatory = $false)]
    [int]$Port = 5432,

    [Parameter(Mandatory = $false)]
    [string]$User = "postgres.dvbqjjwudtbkzjmlcvgo",

    [Parameter(Mandatory = $false)]
    [string]$Database = "postgres",

    [Parameter(Mandatory = $false)]
    [string]$Password = $null,

    [Parameter(Mandatory = $false)]
    [switch]$PrepareOnly,

    [Parameter(Mandatory = $false)]
    [switch]$VerifyOnly,

    [Parameter(Mandatory = $false)]
    [switch]$DryRun,

    [Parameter(Mandatory = $false)]
    [switch]$ForceReprepare
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " JANDRISHTI SUPABASE PRODUCTION DATABASE RESILIENT IMPORT RUNNER" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

# 1. Verify Prerequisites
Write-Host "[1/4] Checking environment dependencies..." -ForegroundColor Yellow

$psqlPath = Get-Command "psql" -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "[ERROR] 'psql' was not found in your PATH. Please ensure PostgreSQL client tools are installed." -ForegroundColor Red
    exit 1
}
Write-Host " -> Found psql: $($psqlPath.Source)" -ForegroundColor Green

$pythonPath = Get-Command "python" -ErrorAction SilentlyContinue
if (-not $pythonPath) {
    Write-Host "[ERROR] 'python' was not found in your PATH." -ForegroundColor Red
    exit 1
}
Write-Host " -> Found python: $($pythonPath.Source)" -ForegroundColor Green

# 2. Resolve Database Password
if (-not $PrepareOnly) {
    if (-not $Password) {
        if ($env:PGPASSWORD) {
            $Password = $env:PGPASSWORD
            Write-Host " -> Using database password from `$env:PGPASSWORD" -ForegroundColor Green
        } else {
            Write-Host "`nPlease enter the Supabase database password for '$User':" -ForegroundColor Yellow
            $securePass = Read-Host -AsSecureString
            $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
            $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
        }
    }
}

# 3. Build Arguments for Python Core Engine
$scriptPath = Join-Path $PSScriptRoot "import_remaining.py"
$pyArgs = @(
    $scriptPath,
    "--host", $HostName,
    "--port", $Port,
    "--user", $User,
    "--dbname", $Database
)

if ($Password) {
    $pyArgs += @("--password", $Password)
}

if ($PrepareOnly) {
    $pyArgs += "--prepare-only"
}

if ($VerifyOnly) {
    $pyArgs += "--verify-only"
}

if ($DryRun) {
    $pyArgs += "--dry-run"
}

if ($ForceReprepare) {
    $pyArgs += "--force-reprepare"
}

# 4. Execute Core Engine
Write-Host "`n[2/4] Launching JanDrishti Production Import Engine..." -ForegroundColor Cyan

$env:PYTHONIOENCODING = "utf-8"
& python @pyArgs

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host "`n==========================================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Operation completed successfully!" -ForegroundColor Green
    Write-Host " Progress Log : database/import_remaining/import_progress.log" -ForegroundColor Green
    Write-Host " State File   : database/import_remaining/import_state.json" -ForegroundColor Green
    Write-Host "==========================================================================" -ForegroundColor Green
} else {
    Write-Host "`n==========================================================================" -ForegroundColor Red
    Write-Host " [HALTED] Import interrupted or failed with exit code $exitCode." -ForegroundColor Red
    Write-Host " You can safely resume at any time by re-running this command." -ForegroundColor Yellow
    Write-Host " See database/import_remaining/import_progress.log for detailed diagnostics." -ForegroundColor Yellow
    Write-Host "==========================================================================" -ForegroundColor Red
}

exit $exitCode
