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
# Em desenvolvimento (DEBUG=True), permitimos qualquer origem para facilitar testes com Expo Go e túneis
if settings.DEBUG:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # FastAPI exige False quando allow_origins=["*"]
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# ── Routes ────────────────────────────────────────────────────────────────────
from fastapi.staticfiles import StaticFiles
import os
from app.api.v1.routes import notifications

os.makedirs("media/photos", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

app.include_router(api_router, prefix="/api/v1")
app.include_router(notifications.router)


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