from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## KORTA API 💈

API da plataforma de descoberta e marcação de barbearias em Angola.

### Módulos
- **Auth** — Registo, login e refresh de tokens JWT
- **Users** — Perfil do utilizador
- **Barbershops** — CRUD de barbearias, serviços, geolocalização
- **Bookings** — Marcações online com verificação de conflitos
- **Reviews** — Sistema de avaliações

### Autenticação
Usa `Bearer Token` no header `Authorization`.
Obtém o token via `/api/v1/auth/login`.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}