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

  $rebasePaths = @(
    (@(Invoke-Git @('rev-parse', '--git-path', 'rebase-merge') -Capture) -join "`n").Trim(),
    (@(Invoke-Git @('rev-parse', '--git-path', 'rebase-apply') -Capture) -join "`n").Trim()
  )
  foreach ($rebasePath in $rebasePaths) {
    $resolvedRebasePath = if ([IO.Path]::IsPathRooted($rebasePath)) {
      $rebasePath
    } else {
      Join-Path $repositoryRoot $rebasePath
    }

    if (Test-Path -LiteralPath $resolvedRebasePath) {
      Write-Error 'A sincronização automática foi pausada: há um rebase em andamento. Resolva os conflitos e sincronize manualmente.'
      exit 2
    }
  }

  $unmergedFiles = @(Invoke-Git @('diff', '--name-only', '--diff-filter=U') -Capture)
  if ($unmergedFiles.Count -gt 0) {
    Write-Error 'A sincronização automática foi pausada: há conflitos de merge. Resolva-os e sincronize manualmente.'
    exit 2
  }

  Invoke-Git @('config', '--local', 'user.name', 'GitHub Auto Sync') | Out-Null
  Invoke-Git @('config', '--local', 'user.email', 'github-auto-sync@users.noreply.github.com') | Out-Null

  # Higienização de segurança antes de adicionar arquivos
  $leakPathPattern = Join-Path $repositoryRoot 'src' 'assets' 'manutencaobiotec-*.json'
  $leakedFiles = @(Get-ChildItem -Path $leakPathPattern -ErrorAction SilentlyContinue)
  if ($leakedFiles.Count -gt 0) {
    Write-Host "Aviso de segurança: Arquivo de credencial sensível detectado antes do commit. Removendo..." -ForegroundColor Yellow
    foreach ($f in $leakedFiles) {
      Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue
    }
  }

  Invoke-Git @('add', '--all')

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
