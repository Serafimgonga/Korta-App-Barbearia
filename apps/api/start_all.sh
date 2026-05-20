#!/usr/bin/env bash
set -euo pipefail

# start_all.sh — Inicia backend + ngrok e actualiza configs para Expo Go
# Local: apps/api
# O script:
#  - cria o venv (se necessário) e instala dependências
#  - inicia uvicorn (porta 8000)
#  - inicia ngrok apontando para 8000
#  - obtém a URL pública do ngrok e atualiza:
#      - apps/mobile/src/api/client.ts (const NGROK_URL)
#      - apps/api/.env (ALLOWED_ORIGINS)
#  - mantém os processos até Ctrl+C; faz cleanup ao sair

API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_CLIENT_PATH="$API_DIR/../mobile/src/api/client.ts"
ENV_FILE="$API_DIR/.env"
VENV_DIR="$API_DIR/venv"
PYTHON="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"

echo "[start_all] API dir: $API_DIR"

if [ ! -x "$PYTHON" ]; then
  echo "[start_all] Virtualenv não encontrado. A criar venv em $VENV_DIR..."
  python3 -m venv "$VENV_DIR"
  "$PIP" install --upgrade pip
  if [ -f "$API_DIR/requirements.txt" ]; then
    echo "[start_all] Instalando dependências (requirements.txt)..."
    "$PIP" install -r "$API_DIR/requirements.txt"
  fi
fi

echo "[start_all] A iniciar uvicorn (porta 8000)..."
"$PYTHON" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload >"$API_DIR/uvicorn.log" 2>&1 &
UVICORN_PID=$!

if ! command -v ngrok >/dev/null 2>&1; then
  echo "[start_all] ERRO: ngrok não encontrado no PATH. Instala o ngrok e re-executa o script."
  kill "$UVICORN_PID" 2>/dev/null || true
  exit 1
fi

echo "[start_all] A iniciar ngrok (http 8000)..."
ngrok http 8000 --log=stdout >"$API_DIR/ngrok.log" 2>&1 &
NGROK_PID=$!

# FIX 1: usar printf em vez de echo "\n" para garantir a newline
cleanup() {
  printf "\n[start_all] A encerrar processos...\n"
  kill "$NGROK_PID" "$UVICORN_PID" 2>/dev/null || true
  wait "$NGROK_PID" 2>/dev/null || true
  wait "$UVICORN_PID" 2>/dev/null || true
  echo "[start_all] Encerrado."
}
trap cleanup EXIT SIGINT SIGTERM

# Esperar pela API local do ngrok e extrair a URL pública HTTPS
NGROK_API="http://127.0.0.1:4040/api/tunnels"
NGROK_URL=""
echo "[start_all] A aguardar a URL pública do ngrok (api: $NGROK_API) ..."
for i in $(seq 1 30); do
  sleep 1
  if curl -s "$NGROK_API" | grep -q "https://"; then
    # FIX 2: ler diretamente o campo public_url dos tunnels em vez de
    # percorrer recursivamente todos os valores (evita múltiplos resultados)
    NGROK_URL=$(curl -s "$NGROK_API" | python3 - <<'PY'
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data.get("tunnels", []):
        url = tunnel.get("public_url", "")
        if url.startswith("https://"):
            print(url)
            break
except Exception:
    pass
PY
    ) || true
    if [ -n "$NGROK_URL" ]; then
      break
    fi
  fi
done

# FIX 3: fallback único e sem mensagem enganosa (eliminado o bloco duplicado)
if [ -z "$NGROK_URL" ]; then
  echo "[start_all] API do ngrok não respondeu. A tentar extrair a URL do log..."
  NGROK_URL=$(grep -o 'https://[^ \n]*ngrok[^ \n]*' "$API_DIR/ngrok.log" | head -n1 || true)
fi

if [ -z "$NGROK_URL" ]; then
  echo "[start_all] ERRO: não foi possível obter a URL do ngrok. Conteúdo de $API_DIR/ngrok.log (últimas 50 linhas):"
  tail -n 50 "$API_DIR/ngrok.log" || true
  exit 1
fi

echo "[start_all] URL pública do ngrok: $NGROK_URL"

# Atualizar apps/mobile/src/api/client.ts
if [ -f "$MOBILE_CLIENT_PATH" ]; then
  echo "[start_all] A actualizar $MOBILE_CLIENT_PATH ..."
  # Atualiza o client.ts de forma robusta usando Python (evita problemas com caracteres especiais)
  MOBILE_CLIENT_PATH="$MOBILE_CLIENT_PATH" NGROK_URL="$NGROK_URL" python3 - <<'PY'
import os, re
from pathlib import Path
path = Path(os.environ['MOBILE_CLIENT_PATH'])
text = path.read_text(encoding='utf-8')
url = os.environ['NGROK_URL']
new = re.sub(r"const NGROK_URL\s*=\s*'.*?';", f"const NGROK_URL = '{url}';", text, flags=re.S)
path.write_text(new, encoding='utf-8')
print('OK')
PY
  echo "[start_all] Atualizado $MOBILE_CLIENT_PATH"
else
  echo "[start_all] Aviso: ficheiro $MOBILE_CLIENT_PATH não encontrado. Ignorando atualização do client.ts"
fi

# Atualizar apps/api/.env ALLOWED_ORIGINS
if [ -f "$ENV_FILE" ]; then
  echo "[start_all] A actualizar $ENV_FILE (ALLOWED_ORIGINS)..."
  # FIX 4 + 5: passar variáveis via ambiente em vez de interpolação no heredoc
  # (evita problemas com caracteres especiais em paths/URLs)
  # FIX 4: URLs antigas do ngrok são removidas antes de adicionar a nova
  # (evita acumulação infinita no .env entre reinicios)
  ENV_FILE="$ENV_FILE" NGROK_URL="$NGROK_URL" python3 - <<'PY'
import os, re, ast

env_file = os.environ["ENV_FILE"]
url      = os.environ["NGROK_URL"]

with open(env_file, 'r', encoding='utf-8') as f:
    s = f.read()

m = re.search(r'(?m)^(ALLOWED_ORIGINS\s*=\s*)(.+)$', s)
if m:
    prefix = m.group(1)
    value  = m.group(2).strip()
    try:
        lst = ast.literal_eval(value)
        if not isinstance(lst, list):
            lst = list(lst)
    except Exception:
        lst = re.findall(r'https?://[^\"\s\]]+', value)
    # Remover entradas antigas do ngrok para não acumular entre sessões
    lst = [x for x in lst if "ngrok" not in x]
    lst.append(url)
    new = '[' + ', '.join('"%s"' % x for x in lst) + ']'
    s = s[:m.start()] + prefix + new + s[m.end():]
else:
    s = s + '\nALLOWED_ORIGINS=["%s"]\n' % url

with open(env_file, 'w', encoding='utf-8') as f:
    f.write(s)
print('OK')
PY
  echo "[start_all] Atualizado $ENV_FILE"
else
  echo "[start_all] Aviso: $ENV_FILE não encontrado. Ignorando atualização do .env"
fi

echo "[start_all] Tudo pronto — o script mantém os processos em execução (Ctrl+C para parar)."
wait