#!/usr/bin/env bash
set -e

REPOSITORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_REMOTE="https://github.com/matheuscruz266/sistema-de-opera--o-florestal-rkm4hvr82.git"

cd "$REPOSITORY_ROOT"

echo "Iniciando sincronização (PULL) do GitHub..."

# 1. Validação do repositório Git
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Erro: O diretório não é um repositório Git." >&2
  exit 1
fi

GIT_ROOT="$(git rev-parse --show-toplevel)"
if [ "$GIT_ROOT" != "$REPOSITORY_ROOT" ]; then
  echo "Aviso: Workspace root ($REPOSITORY_ROOT) difere de git toplevel ($GIT_ROOT)."
fi

# 2. Branch atual
CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || true)"
if [ -z "$CURRENT_BRANCH" ]; then
  CURRENT_BRANCH="main"
fi

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Aviso: Branch atual é '$CURRENT_BRANCH'. A sincronização padrão é para 'main'."
fi

# 3. Validação do remoto origin
REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [ -n "$REMOTE_URL" ] && [ "$REMOTE_URL" != "$EXPECTED_REMOTE" ]; then
  echo "Aviso: Remoto 'origin' ($REMOTE_URL) difere do esperado ($EXPECTED_REMOTE)."
fi

# 4. Checagem de rebase em andamento
REBASE_MERGE="$(git rev-parse --git-path rebase-merge 2>/dev/null || true)"
REBASE_APPLY="$(git rev-parse --git-path rebase-apply 2>/dev/null || true)"
if [ -d "$REBASE_MERGE" ] || [ -d "$REBASE_APPLY" ]; then
  echo "Erro: Sincronização pausada - há um rebase em andamento. Resolva ou aborte com 'git rebase --abort'." >&2
  exit 2
fi

# 5. Conflitos não resolvidos
UNMERGED="$(git diff --name-only --diff-filter=U 2>/dev/null || true)"
if [ -n "$UNMERGED" ]; then
  echo "Erro: Arquivos com conflito não resolvidos. Resolva antes de prosseguir." >&2
  exit 2
fi

# 6. Fetch do remoto
echo "Buscando atualizações de origin main (git fetch origin main)..."
if ! git fetch origin main; then
  echo "Erro: Falha ao buscar atualizações do remoto origin main. Verifique conexão e credenciais." >&2
  exit 1
fi

# 7. Comparar HEAD com origin/main
LOCAL_COMMIT="$(git rev-parse HEAD 2>/dev/null || true)"
REMOTE_COMMIT="$(git rev-parse origin/main 2>/dev/null || true)"

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
  echo "Sua cópia local já está 100% atualizada com o remoto origin/main (${LOCAL_COMMIT:0:7})."
  exit 0
fi

BEHIND="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)"
AHEAD="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"

echo "Status em relação ao origin/main: $BEHIND commit(s) atrás (para puxar), $AHEAD commit(s) à frente (locais)."

if [ "$BEHIND" -eq 0 ]; then
  echo "Nenhum commit novo no remoto para puxar. A branch local está atualizada ou à frente."
  if [ "$AHEAD" -gt 0 ]; then
    echo "Você possui $AHEAD commit(s) locais prontos para push (execute 'npm run git:sync')."
  fi
  exit 0
fi

# 8. Executar pull com rebase e autostash
echo "Puxando $BEHIND commit(s) novos do GitHub (git pull --rebase --autostash origin main)..."
if git pull --rebase --autostash origin main; then
  echo "Sincronização PULL concluída com sucesso!"
  # Garantir que o segredo antigo não reapareceu
  if [ -f "$REPOSITORY_ROOT/src/assets/manutencaobiotec-*.json" ]; then
    echo "Removendo arquivo de credencial sensível restaurado por commit antigo..."
    rm -f "$REPOSITORY_ROOT"/src/assets/manutencaobiotec-*.json
  fi
  exit 0
else
  echo "O pull encontrou conflitos ou histórico divergente. Verifique com 'git status'." >&2
  exit 1
fi
