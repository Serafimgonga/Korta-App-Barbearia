# Workflow — Matching Engine (Request → Match → Accept)

Propósito
- Definir o fluxo, modelo de dados e algoritmo do motor de matchmaking para pedidos on‑demand (V2). Documento pensado para a IA gerar código e migração com segurança.

Conceito chave
- Pipeline: `booking_request` (temporário) → dispatch → `booking` (quando aceite) → estados (a caminho, em serviço, concluído).

Modelo sugerido (`booking_requests`)
- id (PK)
- client_id (FK → users)
- service_id (FK → services)
- lat, lng (float)
- radius_km (int)
- status (enum: REQUESTED, MATCHING, EXPIRED, ASSIGNED, CANCELLED)
- created_at, expires_at
- assigned_barber_id (nullable)
- attempted_barbers (JSON list) — barbeiros já notificados

Lógica de dispatch (pseudocódigo)
```
def dispatch_request(req):
    candidates = find_barbers(online=True, within=req.radius_km, offers=req.service_id)
    ranked = rank_by(distance, rating, response_time)
    for barber in ranked:
        notify(barber, req)
        wait(timeout_seconds)
        if barber.accepted:
            create_booking(req, barber)
            return booking
    # fallback: broadcast to all or expand raio
    broadcast(req)
    return None
```

API proposta
- `POST /api/v1/bookings/request` — cria `booking_request` e inicia dispatch.
- `GET /api/v1/booking_requests/{id}` — retorna estado atual.
- `POST /api/v1/booking_requests/{id}/accept` — endpoint usado por barber (ou socket message) para aceitar.

Critérios de aceitação (matching)
- `booking_request` persistido e com TTL (expires_at).
- Dispatch envia notificações (polling/push) e respeita timeouts.
- Ao aceitar, `booking` é criado com verificação de conflito e transação segura.
- Logs de tentativas e métricas básicas (tentativas, tempo até aceitar).

Testes básicos
- Simular um `booking_request` com 3 barbers online; verificar que o primeiro que aceitar gera `booking`.
- Verificar fallback: se ninguém aceita em X segundos, expandir raio e repetir.

Notas para a IA
- Ao implementar: criar modelo + migration, repository com queries eficientes (index em location), service de dispatch respeitando retry/timeouts, e testes end-to-end com seed.
