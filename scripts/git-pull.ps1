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
    if (-not $Capture) {
      foreach ($line in $output) {
        Write-Host $line
      }
    }
    throw "git $($Arguments -join ' ') falhou com código $exitCode. Detalhes: $($output -join "`n")"
  }

  if ($Capture) {
    return $output
  }

  foreach ($line in $output) {
    Write-Host $line
  }
}

try {
  Write-Host "Iniciando sincronização (PULL) do GitHub..." -ForegroundColor Cyan

  # 1. Validação do repositório Git
  $gitRoot = (@(Invoke-Git @('rev-parse', '--show-toplevel') -Capture)) -join "`n"
  $gitRoot = $gitRoot.Trim()
  $root = (Resolve-Path -LiteralPath $gitRoot).Path
  if (-not [string]::Equals($root, $repositoryRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'A pasta do workspace não é a raiz do repositório Git.'
  }

  # 2. Validação da branch atual
  $branch = (@(Invoke-Git @('branch', '--show-current') -Capture) -join "`n").Trim()
  if ($branch -ne 'main') {
    throw "A sincronização por pull está configurada para a branch 'main' (branch atual: '$branch'). Alterne para 'main' com: git checkout main"
  }

  # 3. Validação do remoto origin
  $remote = (@(Invoke-Git @('remote', 'get-url', 'origin') -Capture) -join "`n").Trim()
  if (-not [string]::Equals($remote, $expectedRemote, [StringComparison]::OrdinalIgnoreCase)) {
    Write-Warning "Aviso: o remoto 'origin' ($remote) difere do esperado ($expectedRemote)."
  }

  # 4. Checagem de operações de rebase em andamento
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
      Write-Error 'A sincronização por pull foi pausada: há um rebase em andamento. Resolva ou aborte o rebase (git rebase --abort) antes de prosseguir.'
      exit 2
    }
  }

  # 5. Checagem de arquivos com conflito não resolvido
  $unmergedFiles = @(Invoke-Git @('diff', '--name-only', '--diff-filter=U') -Capture)
  if ($unmergedFiles.Count -gt 0) {
    Write-Error 'A sincronização por pull foi pausada: há arquivos com conflito não resolvidos. Resolva os conflitos antes de prosseguir.'
    exit 2
  }

  # 6. Checagem de alterações locais não commitadas
  $dirtyFiles = @(Invoke-Git @('status', '--porcelain') -Capture)
  $hasLocalChanges = $false
  if ($dirtyFiles.Count -gt 0) {
    $cleanLines = @($dirtyFiles | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($cleanLines.Count -gt 0) {
      $hasLocalChanges = $true
      Write-Host "Aviso: Existem alterações locais não commitadas na sua cópia de trabalho:" -ForegroundColor Yellow
      foreach ($line in $cleanLines) {
        Write-Host "  $line"
      }
      Write-Host "Tentando puxar preservando suas alterações locais com autostash..." -ForegroundColor Yellow
    }
  }

  # 7. Buscar atualizações do remoto (fetch)
  Write-Host "Consultando atualizações remotas em origin/main (git fetch origin main)..." -ForegroundColor Cyan
  try {
    Invoke-Git @('fetch', 'origin', 'main')
  } catch {
    Write-Error "Falha ao conectar ou buscar atualizações do remoto origin/main. Verifique sua conexão à internet e se possui permissão de leitura no repositório GitHub."
    exit 1
  }

  # 8. Comparar histórico local com origin/main
  $localCommit = (@(Invoke-Git @('rev-parse', 'HEAD') -Capture) -join "`n").Trim()
  $remoteCommit = (@(Invoke-Git @('rev-parse', 'origin/main') -Capture) -join "`n").Trim()

  if ($localCommit -eq $remoteCommit) {
    Write-Host "Sua cópia local já está 100% atualizada com o remoto origin/main ($($localCommit.Substring(0, 7)))." -ForegroundColor Green
    exit 0
  }

  $behind = (@(Invoke-Git @('rev-list', '--count', 'HEAD..origin/main') -Capture) -join "`n").Trim()
  $ahead = (@(Invoke-Git @('rev-list', '--count', 'origin/main..HEAD') -Capture) -join "`n").Trim()

  Write-Host "Status em relação ao origin/main: $behind commit(s) atrás (para puxar), $ahead commit(s) à frente (locais)." -ForegroundColor Cyan

  if ([int]$behind -eq 0) {
    Write-Host "Nenhum commit novo no remoto para puxar. Sua branch local contém o histórico do remoto (ou está à frente)." -ForegroundColor Green
    if ([int]$ahead -gt 0) {
      Write-Host "Nota: Você tem $ahead commit(s) locais não enviados ao remoto. (Se o push estiver bloqueado pela proteção de segredos do GitHub em commit antigo, seus commits locais continuam preservados com segurança na sua máquina)." -ForegroundColor Yellow
    }
    exit 0
  }

  # 9. Executar o pull (usando rebase com autostash para mesclar commits limpos sem perder trabalho)
  Write-Host "Puxando $behind commit(s) novos do GitHub (git pull --rebase --autostash origin main)..." -ForegroundColor Cyan
  try {
    Invoke-Git @('pull', '--rebase', '--autostash', 'origin', 'main')
    Write-Host "Sincronização PULL concluída com sucesso! Sua cópia local foi atualizada com o GitHub." -ForegroundColor Green

    # Higienização automática: remover credencial de teste se restaurada por commit antigo
    $leakPathPattern = Join-Path $repositoryRoot 'src' 'assets' 'manutencaobiotec-*.json'
    $leakedFiles = @(Get-ChildItem -Path $leakPathPattern -ErrorAction SilentlyContinue)
    if ($leakedFiles.Count -gt 0) {
      Write-Host "Aviso de segurança: Arquivo de credencial sensível detectado após pull. Removendo..." -ForegroundColor Yellow
      foreach ($f in $leakedFiles) {
        Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {
    Write-Host ""
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Red
    Write-Host "O pull encontrou divergência ou conflito entre o remoto e seu histórico local." -ForegroundColor Red
    Write-Host "Orientações para resolução:" -ForegroundColor Yellow
    Write-Host " 1. Se houver conflitos de merge/rebase:" -ForegroundColor White
    Write-Host "    - Verifique os arquivos em conflito com: git status" -ForegroundColor White
    Write-Host "    - Resolva as marcações (<<<<<<< / ======= / >>>>>>>) nos arquivos" -ForegroundColor White
    Write-Host "    - Adicione os arquivos resolvidos com: git add <arquivo>" -ForegroundColor White
    Write-Host "    - Continue o rebase com: git rebase --continue" -ForegroundColor White
    Write-Host "    - Ou, se preferir cancelar e voltar ao estado anterior: git rebase --abort" -ForegroundColor White
    Write-Host " 2. Se o histórico remoto e local forem completamente divergentes:" -ForegroundColor White
    Write-Host "    - Você pode tentar: git pull origin main --no-rebase --allow-unrelated-histories" -ForegroundColor White
    Write-Host " 3. Se desejar descartar alterações locais e espelhar exatamente o remoto:" -ForegroundColor White
    Write-Host "    - ATENÇÃO: Isso sobrescreverá alterações locais não salvas!" -ForegroundColor Yellow
    Write-Host "    - git fetch origin main && git reset --hard origin/main" -ForegroundColor White
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Red
    exit 1
  }

} catch {
  Write-Error "Sincronização (PULL) do GitHub falhou: $($_.Exception.Message)"
  exit 1
}