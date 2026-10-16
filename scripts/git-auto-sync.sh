#!/usr/bin/env bash
set -e

REPOSITORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_REMOTE="https://github.com/matheuscruz266/sistema-de-opera--o-florestal-rkm4hvr82.git"

cd "$REPOSITORY_ROOT"

echo "Iniciando sincronização e push para o GitHub..."

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Erro: O diretório não é um repositório Git." >&2
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || true)"
if [ "$CURRENT_BRANCH" != "main" ] && [ -n "$CURRENT_BRANCH" ]; then
  echo "Aviso: Sincronização configurada preferencialmente para 'main' (atual: '$CURRENT_BRANCH')."
fi

# Configuração de usuário para commit automático caso não esteja configurado
if [ -z "$(git config user.name 2>/dev/null || true)" ]; then
  git config --local user.name "GitHub Auto Sync"
  git config --local user.email "github-auto-sync@users.noreply.github.com"
fi

# Previne commit acidental de arquivo de credencial sensível
if [ -f "$REPOSITORY_ROOT/src/assets/manutencaobiotec-*.json" ]; then
  echo "Removendo arquivo sensível antes do commit..."
  rm -f "$REPOSITORY_ROOT"/src/assets/manutencaobiotec-*.json
fi

git add --all

if ! git diff --cached --quiet 2>/dev/null; then
  echo "Criando commit com alterações locais..."
  git commit -m "chore: auto-sync local changes"
fi

echo "Puxando e rebaseando alterações remotas..."
git pull --rebase origin main || true

AHEAD="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
if [ "$AHEAD" -gt 0 ]; then
  echo "Enviando $AHEAD commit(s) para o GitHub (git push origin main)..."
  git push origin main
  echo "Push concluído com sucesso!"
else
  echo "GitHub já está atualizado com o histórico local."
fi
