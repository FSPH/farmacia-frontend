#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/home/ovidio-neto/farmacia"
MEMORIES_REPO_DIR="$PROJECT_ROOT/memories"
MEMORIES_FILE="$MEMORIES_REPO_DIR/context-summary.md"
MEMORIES_COMMIT_MESSAGE="Atualiza resumo de contexto do projeto farmacia"
PROJECT_COMMIT_MESSAGE="Atualiza referência do submódulo memories"
TS_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

require_git_repo() {
  local repo_dir="$1"

  if ! git -C "$repo_dir" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Diretório não é um repositório Git válido: $repo_dir"
    exit 1
  fi
}

require_clean_file() {
  if [[ ! -f "$MEMORIES_FILE" ]]; then
    echo "Arquivo obrigatório ausente: $MEMORIES_FILE"
    exit 1
  fi

  if [[ ! -s "$MEMORIES_FILE" ]]; then
    echo "Arquivo obrigatório vazio: $MEMORIES_FILE"
    exit 1
  fi
}

commit_if_needed() {
  local repo_dir="$1"
  local add_path="$2"
  local commit_message="$3"

  git -C "$repo_dir" add "$add_path"

  if git -C "$repo_dir" diff --cached --quiet; then
    return 1
  fi

  git -C "$repo_dir" commit -m "$commit_message"
  git -C "$repo_dir" push
  return 0
}

require_git_repo "$PROJECT_ROOT"
require_git_repo "$MEMORIES_REPO_DIR"
require_clean_file

echo "[$TS_UTC] Validando repositório de memórias em $MEMORIES_REPO_DIR"

memories_head_before="$(git -C "$MEMORIES_REPO_DIR" rev-parse HEAD)"
memories_changed=0

if commit_if_needed "$MEMORIES_REPO_DIR" "context-summary.md" "$MEMORIES_COMMIT_MESSAGE"; then
  memories_changed=1
  echo "Resumo de contexto publicado no repositório de memórias."
else
  echo "Nenhuma alteração para publicar em memories/context-summary.md."
fi

memories_head_after="$(git -C "$MEMORIES_REPO_DIR" rev-parse HEAD)"

if [[ "$memories_head_before" != "$memories_head_after" || "$memories_changed" -eq 1 ]]; then
  if commit_if_needed "$PROJECT_ROOT" "memories" "$PROJECT_COMMIT_MESSAGE"; then
    echo "Referência do submódulo memories atualizada no repositório principal."
  else
    echo "Submódulo atualizado, mas sem mudança pendente no repositório principal."
  fi
else
  echo "HEAD do submódulo não mudou; nenhuma atualização necessária no repositório principal."
fi

echo "Fluxo de atualização de memories concluído em $TS_UTC"
