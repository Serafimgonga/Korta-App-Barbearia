#!/usr/bin/env python3
"""
KORTA API — Script de arranque com localtunnel (sem autenticação)
Inicia o FastAPI e expõe a API publicamente para o Expo Go.

Uso:
  cd apps/api
  ./venv/bin/python tunnel.py
"""

import subprocess
import threading
import time
import sys
import re


def start_localtunnel(port: int = 8000):
    """Inicia o localtunnel via npx (sem instalar nada globalmente)."""
    print("🌐 A abrir túnel localtunnel...")
    try:
        proc = subprocess.Popen(
            ["npx", "--yes", "localtunnel", "--port", str(port)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Aguardar a URL ser impressa no stdout
        for line in proc.stdout:
            line = line.strip()
            if "https://" in line:
                url = re.search(r'https://[\w.-]+\.loca\.lt', line)
                if url:
                    return url.group(0), proc

        return None, proc
    except FileNotFoundError:
        print("❌ npx não encontrado. Instala o Node.js.")
        return None, None


def start_uvicorn():
    """Inicia o servidor FastAPI."""
    print("🔥 A iniciar FastAPI na porta 8000...")
    return subprocess.Popen(
        ["./venv/bin/python", "-m", "uvicorn", "app.main:app",
         "--host", "0.0.0.0", "--port", "8000", "--reload"],
    )


def print_instructions(url: str):
    """Imprime as instruções para o utilizador."""
    print("\n" + "=" * 57)
    print("  🚀 TUNNEL ATIVO — KORTA API acessível publicamente!")
    print("=" * 57)
    print(f"\n  🌐 URL Pública: {url}")
    print(f"\n  📱 Passo a passo:")
    print(f"     1. Abre o ficheiro:")
    print(f"        apps/mobile/src/api/client.ts")
    print(f"     2. Altera a linha 18 para:")
    print(f"        const NGROK_URL = '{url}';")
    print(f"     3. Guarda — o Expo recarrega automaticamente ✅")
    print("\n" + "=" * 57)
    print("  Pressiona Ctrl+C para parar")
    print("=" * 57 + "\n")


def main():
    print("=" * 57)
    print("  💈 KORTA API — Tunnel para Expo Go")
    print("=" * 57)

    # 1. Iniciar o uvicorn em background
    uvicorn_proc = start_uvicorn()
    time.sleep(2)  # Dar tempo ao uvicorn para arrancar

    # 2. Iniciar o localtunnel
    url, tunnel_proc = start_localtunnel(8000)

    if url:
        print_instructions(url)
    else:
        print("⚠️  Não foi possível obter a URL do localtunnel.")
        print("    Verifica se tens internet e o Node.js instalado.")

    # 3. Aguardar Ctrl+C
    try:
        uvicorn_proc.wait()
    except KeyboardInterrupt:
        print("\n\n⏹️  A encerrar...")
        uvicorn_proc.terminate()
        if tunnel_proc:
            tunnel_proc.terminate()
        print("✅ Encerrado com sucesso!")


if __name__ == "__main__":
    main()
