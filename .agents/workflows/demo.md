# Workflow — Demo & Seed (Como reproduzir a demo localmente)

Objetivo
- Fornecer passos claros e comandos para levantar a stack local e demonstrar o fluxo básico (pedido → aceitação → tracking → avaliação).

Passos rápidos
1) Subir Postgres (docker)
```bash
cd apps/api
docker-compose up -d db
```
2) Ambiente Python e seed
```bash
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_rich.py    # gera utilizadores de teste e barbearias
```
3) Iniciar API
```bash
./venv/bin/python -m uvicorn app.main:app --reload --port 8000
# ou
./venv/bin/python tunnel.py   # gera URL pública para o mobile
```
4) Mobile (Expo)
```bash
cd apps/mobile
npm install
# atualizar NGROK_URL em apps/mobile/src/api/client.ts com a URL do túnel
npx expo start --tunnel
```

Testes manuais (curl)
- Obter token (exemplo genérico):
```bash
curl -X POST http://localhost:8000/api/v1/auth/login -d '{"email":"serafim@korta.ao","password":"korta123"}'
# resposta: {"access_token": "<TOKEN>"}
```
- Criar booking_request:
```bash
curl -X POST http://localhost:8000/api/v1/bookings/request \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"service_id":1, "lat": -8.8, "lng": 13.2, "type":"home", "radius_km":5}'
```

Validações esperadas
- `booking_request` criado e dispatch iniciado.
- Barbeiro online (via Expo) recebe notificação/polling e pode aceitar.
- Ao aceitar, verificar que `booking` existe e estados transitam até `COMPLETED`.

Observações
- Use `seed_rich.py` para dados consistentes em demos.
- Para teste em dispositivo físico, use `tunnel.py` e atualize `NGROK_URL` no cliente mobile.
