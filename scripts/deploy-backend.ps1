#Requires -Version 5.1
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$envFile = Join-Path $PSScriptRoot "..\supabase\.env.local"
if (-not (Test-Path $envFile)) {
  Write-Error "Missing supabase/.env.local"
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim()
  }
}

$ref = if ($env:SUPABASE_PROJECT_REF) { $env:SUPABASE_PROJECT_REF } else { "jcanswwvditynjwvtmec" }
$sb = "npx --yes supabase@latest"

Write-Host "==> Login"
& npx --yes supabase@latest login --token $env:SUPABASE_ACCESS_TOKEN

Write-Host "==> Link $ref"
& npx --yes supabase@latest link --project-ref $ref --password $env:SUPABASE_DB_PASSWORD

Write-Host "==> db push"
& npx --yes supabase@latest db push --yes

Write-Host "==> secrets"
& npx --yes supabase@latest secrets set "CRON_SECRET=$($env:CRON_SECRET)"

Write-Host "==> deploy functions"
& npx --yes supabase@latest functions deploy challenge-actions
& npx --yes supabase@latest functions deploy scheduled-jobs
& npx --yes supabase@latest functions deploy submit-feedback

Write-Host "==> api keys"
& npx --yes supabase@latest projects api-keys --project-ref $ref -o json | Out-File (Join-Path $PSScriptRoot "..\supabase\.api-keys.json") -Encoding utf8

Write-Host "==> pg_cron"
$cronTemplate = Get-Content (Join-Path $PSScriptRoot "cron-schedule.sql") -Raw
$cronTemplate = $cronTemplate -replace '__CRON_SECRET__', $env:CRON_SECRET
$cronTemplate = $cronTemplate -replace 'jcanswwvditynjwvtmec', $ref
$cronFile = Join-Path $env:TEMP "commitment-cron-run.sql"
Set-Content -Path $cronFile -Value $cronTemplate -Encoding UTF8
& npx --yes supabase@latest db query --linked --file $cronFile
Remove-Item $cronFile -ErrorAction SilentlyContinue

Write-Host "==> dev test users"
& (Join-Path $PSScriptRoot "create-dev-users.ps1") -ProjectRef $ref

Write-Host "Done."
