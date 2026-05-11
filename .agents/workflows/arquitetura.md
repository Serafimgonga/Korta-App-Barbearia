---
description: 🔥 Padrão de arquitetura dentro do mobile
---

🔥 Padrão de arquitetura dentro do mobile
👉 Separação clara:
Camada	Função
UI	Components / Screens
Lógica	Hooks
Estado	Store
API	Services
Config	constants/config

📦 Exemplo de service API
// services/barbers.ts

import api from "../config/api";

export const getBarbers = async () => {
  const response = await api.get("/barbers");
  return response.data;
};

🌐 Config da API
// config/api.ts

import axios from "axios";

const api = axios.create({
  baseURL: "https://api.korta.com",
});

export default api;

⚙️ 3. Organização da API (FastAPI)
🔥 Estrutura profissional
korta-api/
│
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py
│   │   │   │   ├── barbers.py
│   │   │   │   ├── bookings.py
│   │   │   │   └── users.py
│   │   │   └── api.py
│   │
│   ├── utils/
│   └── middleware/
│
├── tests/
├── requirements.txt
└── .env
🔥 Separação importante (arquitetura limpa)
Camada	Função
Routes	endpoints API
Services	lógica de negócio
Repositories	acesso à base de dados
Models	ORM (SQLAlchemy)
Schemas	validação (Pydantic)
📦 Exemplo de endpoint
# routes/barbers.py

from fastapi import APIRouter

router = APIRouter()

@router.get("/barbers")
def get_barbers():
    return [{"name": "Barbearia Korta", "price": 1500}]