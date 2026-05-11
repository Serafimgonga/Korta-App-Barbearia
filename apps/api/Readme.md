# KORTA API 💈

Backend da plataforma de descoberta e marcação de barbearias em Angola.

## Stack
- **FastAPI** — Framework web
- **PostgreSQL** — Base de dados
- **SQLAlchemy** — ORM
- **Alembic** — Migrations
- **Pydantic v2** — Validação
- **JWT** — Autenticação

## Estrutura

```
korta-api/
├── app/
│   ├── main.py              # Entry point FastAPI
│   ├── core/
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   ├── database.py      # Engine + SessionLocal
│   │   └── security.py      # JWT + bcrypt
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic schemas
│   ├── repositories/        # Queries DB
│   ├── services/            # Lógica de negócio
│   ├── api/v1/routes/       # Endpoints REST
│   └── utils/
│       └── dependencies.py  # get_current_user, require_barber
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── alembic.ini
```

## Setup local

### 1. Clonar e instalar dependências
```bash
git clone <repo>
cd korta-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com as tuas credenciais
```

### 3. Subir PostgreSQL com Docker
```bash
docker-compose up db -d
```

### 4. Criar tabelas
```bash
# Opção rápida para desenvolvimento:
python -c "from app.core.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"

# Ou com Alembic (produção):
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### 5. Iniciar API
```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Aceder à documentação
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/v1/auth/register | Registo |
| POST | /api/v1/auth/login | Login |
| GET | /api/v1/barbershops | Listar barbearias |
| GET | /api/v1/barbershops/nearby | Barbearias próximas |
| GET | /api/v1/barbershops/{id} | Detalhe |
| POST | /api/v1/barbershops | Criar barbearia |
| GET | /api/v1/barbershops/{id}/services | Serviços |
| POST | /api/v1/bookings | Nova marcação |
| GET | /api/v1/bookings/me | Minhas marcações |
| POST | /api/v1/reviews | Avaliar barbearia |

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| DATABASE_URL | URL PostgreSQL |
| SECRET_KEY | Chave JWT (muda em produção!) |
| CLOUDINARY_* | Credenciais Cloudinary |
| GOOGLE_MAPS_API_KEY | Chave Google Maps |

## Deploy (produção)

```bash
docker-compose up -d
```