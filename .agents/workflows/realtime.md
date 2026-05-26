---
description: realtime
---

# Workflow — Real‑time & Notificações (WebSocket / FCM / Polling)

Resumo
- Objetivo: descrever opções e contratos para notificações em tempo real, presença e mensagens de dispatch.

Opções técnicas
- Polling (demo rápido): cliente faz GET a cada N segundos para checar pedidos/updates.
- WebSocket (produção): rota `/ws/notifications` com handshake JWT, mensagens JSON.
- FCM (push): envio de notificações push para dispositivos móveis quando offline.

Rota WebSocket (exemplo)
- Path: `/ws/notifications` (query param `token` ou `Authorization` header)
- Mensagem de entrada (do cliente): `{ "type": "pong" }`
- Mensagem do servidor (para barber):
```
{
  "type": "new_request",
  "request_id": 123,
  "service": { ... },
  "distance_m": 1200
}
```

Mensagens essenciais
- `new_request` — dispatch de pedido
- `request_update` — estado do pedido (MATCHING, EXPIRED)
- `booking_update` — mudança de status do booking
- `presence` — barber online/offline

Escalabilidade
- Usar Redis pub/sub para broadcast entre múltiplos workers/instâncias.
- Persistir device tokens (users -> device_tokens) para enviar FCM quando necessário.

Segurança e TTL
- Validar JWT em handshake.
- Mensagens efémeras: não persistir payloads sensíveis no canal público.
- TTL para `booking_request` para evitar mensagens obsoletas.

Fallback (polling)
- Endpoint: `GET /api/v1/notifications/poll` ou `GET /api/v1/booking_requests/pending`
- Polling interval configurável (ex.: 5s para demo). Implementar rate limit.

Notas para a IA
- Prefira implementar polling para demos rápidos, documentando o caminho para migrar a WebSocket + Redis + FCM.
