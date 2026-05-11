---
description: 🗄️ 4. Organização da base de dados (PostgreSQL)
---

🗄️ 4. Organização da base de dados (PostgreSQL)
Tabelas principais:
👤 users
id
name
phone
role (client/barber)
💈 barbershops
id
name
location
open_hours
status
✂️ services
id
barber_id
name
price
📅 bookings
id
user_id
barber_id
date
status
⭐ reviews
id
user_id
barber_id
rating
comment
🔥 5. Comunicação entre APP e API
Fluxo:
User → Expo App → API (FastAPI) → PostgreSQL
Exemplo real:
Mobile pede barbearias:
GET /api/v1/barbers
API responde:
[
  {
    "id": 1,
    "name": "Barbearia Korta",
    "price": 2000,
    "status": "open"
  }
]
📁 6. Organização de monorepo (RECOMENDADO)

Se quiseres algo mais profissional:

korta/
│
├── apps/
│   ├── mobile/   (Expo)
│   ├── api/      (FastAPI)
│
├── packages/
│   ├── shared-types/
│   ├── utils/
│
└── README.md
🚀 7. Deploy (produção)
API:
Docker
VPS (DigitalOcean / Hetzner / AWS)
Mobile:
Expo EAS Build
🔥 8. Boas práticas importantes
Mobile:
não colocar lógica de API nos components
usar services
usar hooks
tipagem TypeScript
API:
separar routes / services / db
usar env variables
versionar API (/v1)
🧠 9. Arquitetura mental simples

Pensa assim:

UI (Expo)
   ↓
Services
   ↓
API Client
   ↓
FastAPI
   ↓
Database
⚡ 10. Resumo final
Cliente (Expo)
UI limpa
services API
hooks
store
API (FastAPI)
routes
services
repositories
models
DB
PostgreSQL estruturado