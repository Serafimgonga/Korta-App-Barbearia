from fastapi import APIRouter
from app.api.v1.routes import auth, bookings, barbershops, users, reviews

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(barbershops.router)
api_router.include_router(bookings.router)
api_router.include_router(reviews.router)
