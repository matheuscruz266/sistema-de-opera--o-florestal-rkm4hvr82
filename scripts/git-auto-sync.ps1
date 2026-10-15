$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$expectedRemote = 'https://github.com/matheuscruz266/sistema-de-opera--o-florestal-rkm4hvr82.git'

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments,
    [switch]$Capture
  )

  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    $output = & git -C $repositoryRoot @Arguments 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  if ($exitCode -ne 0) {
    foreach ($line in $output) {
      Write-Host $line
    }
    throw "git $($Arguments -join ' ') falhou com código $exitCode."
  }

  if ($Capture) {
    return $output
  }

  foreach ($line in $output) {
    Write-Host $line
  }
}

try {
  $gitRoot = (@(Invoke-Git @('rev-parse', '--show-toplevel') -Capture)) -join "`n"
  $gitRoot = $gitRoot.Trim()
  $root = (Resolve-Path -LiteralPath $gitRoot).Path
  if (-not [string]::Equals($root, $repositoryRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'A pasta do workspace não é a raiz do repositório Git.'
  }

  $branch = (@(Invoke-Git @('branch', '--show-current') -Capture) -join "`n").Trim()
  if ($branch -ne 'main') {
    throw "A sincronização automática só é permitida na branch main (branch atual: $branch)."
  }

  $remote = (@(Invoke-Git @('remote', 'get-url', 'origin') -Capture) -join "`n").Trim()
  if (-not [string]::Equals($remote, $expectedRemote, [StringComparison]::OrdinalIgnoreCase)) {
    throw "O remoto origin não corresponde ao repositório esperado: $expectedRemote"
  }

  Invoke-Git @('config', '--local', 'user.name', 'GitHub Auto Sync') | Out-Null
  Invoke-Git @('config', '--local', 'user.email', 'github-auto-sync@users.noreply.github.com') | Out-Null

  Invoke-Git @('add', '--all')

  $stagedEnvChanges = @(Invoke-Git @('diff', '--cached', '--name-only', '--', '.env') -Capture)
  if ($stagedEnvChanges.Count -gt 0) {
    $envFile = Join-Path $repositoryRoot '.env'
    if (Test-Path -LiteralPath $envFile -PathType Leaf) {
      $sensitiveKeys = @()
      $envLines = Get-Content -LiteralPath $envFile
      foreach ($line in $envLines) {
        if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
          $key = $Matches[1]
          $value = $Matches[2].Trim().Trim('"').Trim("'")
          $looksLikePlaceholder = $value -match '^(?i:change.?me|your.?.*|replace.?me|example|xxx+|\*+)$'
          $looksLikeSecretKey = $key -match '(?i)(SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE.?KEY|API.?KEY|CLIENT.?SECRET|ACCESS.?KEY|CREDENTIAL)'
          $containsUrlCredentials = $value -match '(?i)^[a-z][a-z0-9+.-]*://[^/\s:@]+:[^/\s@]+@'
          $containsPrivateKey = $value -match '-----BEGIN [A-Z ]*PRIVATE KEY-----'

          if (($looksLikeSecretKey -and $value.Length -gt 0 -and -not $looksLikePlaceholder) -or $containsUrlCredentials -or $containsPrivateKey) {
            $sensitiveKeys += $key
          }
        }
      }

      if ($sensitiveKeys.Count -gt 0) {
        $keys = $sensitiveKeys | Select-Object -Unique
        throw "O envio foi interrompido: .env contém valores com aparência de credencial nas variáveis $($keys -join ', '). Revise o arquivo e faça o push manualmente após a revisão."
      }
    }
  }

  $stagedChanges = @(Invoke-Git @('diff', '--cached', '--name-only') -Capture)
  if ($stagedChanges.Count -gt 0) {
    Invoke-Git @('commit', '-m', 'chore: auto-sync local changes')
  }

  Invoke-Git @('pull', '--rebase', 'origin', 'main')

  $ahead = (@(Invoke-Git @('rev-list', '--count', 'origin/main..HEAD') -Capture) -join "`n").Trim()
  if ([int]$ahead -gt 0) {
    Invoke-Git @('push', 'origin', 'main')
  } else {
    Write-Host 'GitHub já está sincronizado com a branch main.'
  }
} catch {
  Write-Error "Sincronização automática do GitHub falhou: $($_.Exception.Message)"
  exit 1
}
