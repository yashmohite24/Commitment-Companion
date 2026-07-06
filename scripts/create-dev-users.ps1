#Requires -Version 5.1
# Creates dev test users (idempotent). Requires service role key in env or supabase/.api-keys.json
param(
  [string]$ProjectRef = "jcanswwvditynjwvtmec"
)

$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot ".."
$keysFile = Join-Path $root "supabase\.api-keys.json"

$serviceKey = $env:SUPABASE_SERVICE_ROLE_KEY
if (-not $serviceKey -and (Test-Path $keysFile)) {
  $keys = Get-Content $keysFile -Raw | ConvertFrom-Json
  $serviceKey = ($keys | Where-Object { $_.id -eq "service_role" }).api_key
}
if (-not $serviceKey) {
  Write-Error "Missing service role key. Set SUPABASE_SERVICE_ROLE_KEY or run deploy-backend.ps1 first."
}

$baseUrl = "https://$ProjectRef.supabase.co/auth/v1/admin/users"
$headers = @{
  Authorization = "Bearer $serviceKey"
  apikey        = $serviceKey
  "Content-Type" = "application/json"
}

$users = @(
  @{ email = "challenger@test.local"; password = "password123" },
  @{ email = "companion@test.local"; password = "password123" }
)

foreach ($user in $users) {
  $body = @{ email = $user.email; password = $user.password; email_confirm = $true } | ConvertTo-Json
  try {
    $resp = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body $body
    Write-Host "Created $($user.email)"
  } catch {
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
      $reader = New-Object System.IO.StreamReader($stream)
      $errBody = $reader.ReadToEnd()
      if ($errBody -match "email_exists") {
        Write-Host "Already exists: $($user.email)"
      } else {
        Write-Error "Failed $($user.email): $errBody"
      }
    } else {
      throw
    }
  }
}
