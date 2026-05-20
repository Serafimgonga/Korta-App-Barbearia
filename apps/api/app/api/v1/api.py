from fastapi import APIRouter
from app.api.v1.routes import auth, bookings, barbershops, users, reviews, photos, service_photos

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(barbershops.router)
api_router.include_router(bookings.router)
api_router.include_router(reviews.router)
api_router.include_router(photos.router)  # Rota de fotos das barbearias
api_router.include_router(service_photos.router)  # Rota de fotos dos serviços (Trabalhos Realizados)
