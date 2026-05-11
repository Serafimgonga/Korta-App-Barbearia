#!/usr/bin/env python3
"""
KORTA API — Script de arranque com tunnel ngrok
Inicia o FastAPI e expõe a API publicamente para o Expo Go.

Uso:
  cd apps/api
  ./venv/bin/python tunnel.py
"""

import subprocess
import time
import sys
import os

def main():
    print("=" * 55)
    print("  💈 KORTA API — Tunnel para Expo Go")
    print("=" * 55)

    # Verificar se o token do ngrok está configurado
    try:
        from pyngrok import ngrok, conf
        print("\n✅ pyngrok instalado")
    except ImportError:
        print("❌ pyngrok não instalado. Executa: ./venv/bin/pip install pyngrok")
        sys.exit(1)

    # Configurar token do ngrok (gratuito, regista em ngrok.com)
    ngrok_token = os.getenv("NGROK_AUTHTOKEN", "")
    if ngrok_token:
        ngrok.set_auth_token(ngrok_token)
        print("✅ Token ngrok configurado")
    else:
        print("⚠️  Sem token ngrok — a usar modo anónimo (tempo limitado)")
        print("   Regista-te em https://ngrok.com e adiciona ao .env:")
        print("   NGROK_AUTHTOKEN=o_teu_token\n")

    # Iniciar túnel ngrok na porta 8000 (FastAPI)
    print("🌐 A abrir túnel ngrok...")
    try:
        tunnel = ngrok.connect(8000, "http")
        public_url = tunnel.public_url

        # Forçar HTTPS
        if public_url.startswith("http://"):
            public_url = public_url.replace("http://", "https://", 1)

        print("\n" + "=" * 55)
        print("  🚀 TUNNEL ATIVO!")
        print("=" * 55)
        print(f"\n  URL Pública: {public_url}")
        print(f"\n  📱 No ficheiro:")
        print(f"     apps/mobile/src/api/client.ts")
        print(f"\n  Substitui a linha:")
        print(f"     const NGROK_URL = '';")
        print(f"\n  Por:")
        print(f"     const NGROK_URL = '{public_url}';")
        print("\n" + "=" * 55)
        print("  Pressiona Ctrl+C para parar o servidor")
        print("=" * 55 + "\n")

    except Exception as e:
        print(f"❌ Erro ao abrir túnel: {e}")
        print("   Tenta registar-te em ngrok.com e configurar o NGROK_AUTHTOKEN")
        public_url = None

    # Iniciar FastAPI (uvicorn)
    print("🔥 A iniciar FastAPI...")
    uvicorn_cmd = [
        "./venv/bin/python", "-m", "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ]

    try:
        proc = subprocess.run(uvicorn_cmd)
    except KeyboardInterrupt:
        print("\n\n⏹️  Servidor parado. A fechar túnel ngrok...")
        if public_url:
            ngrok.kill()
        print("✅ Encerrado com sucesso!")


if __name__ == "__main__":
    main()
