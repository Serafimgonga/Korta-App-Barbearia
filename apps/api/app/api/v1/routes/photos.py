from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import Photo, PhotoCreate
from app.repositories import PhotoRepository, BarbershopRepository
from app.utils.dependencies import get_current_user
from app.utils.cloudinary import upload_image, delete_image
from app.models import User
from typing import Optional

router = APIRouter(prefix="/photos", tags=["Fotos"])


@router.get("/barbershop/{barbershop_id}", response_model=list[Photo])
def list_photos(barbershop_id: int, db: Session = Depends(get_db)):
    """Lista todas as fotos de uma barbearia."""
    shop = BarbershopRepository.get_by_id(db, barbershop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Barbearia não encontrada")
    return PhotoRepository.get_by_barbershop(db, barbershop_id)


@router.post("/upload", response_model=Photo, status_code=201)
async def upload_barbershop_photo(
    barbershop_id: int = Form(...),
    photo_type: str = Form("gallery"),
    caption: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Faz upload de uma foto para a barbearia."""
    shop = BarbershopRepository.get_by_id(db, barbershop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Barbearia não encontrada")
    if shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão")

    # Upload para o Cloudinary
    upload_result = upload_image(file.file, folder=f"korta/barbershops/{barbershop_id}")
    if not upload_result:
        raise HTTPException(status_code=500, detail="Erro ao processar imagem")

    return PhotoRepository.create(
        db,
        barbershop_id=barbershop_id,
        url=upload_result["url"],
        public_id=upload_result["public_id"],
        photo_type=photo_type,
        caption=caption,
    )


@router.post("", response_model=Photo, status_code=201)
def add_photo_by_url(
    data: PhotoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Adiciona uma foto a uma barbearia (apenas o dono)."""
    shop = BarbershopRepository.get_by_id(db, data.barbershop_id)
    if not shop:
        raise HTTPException(status_code=404, detail="Barbearia não encontrada")
    if shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão")

    return PhotoRepository.create(
        db,
        barbershop_id=data.barbershop_id,
        url=data.url,
        public_id=data.public_id,
        photo_type=data.photo_type,
        caption=data.caption,
    )


@router.delete("/{photo_id}", status_code=204)
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove uma foto (apenas o dono da barbearia)."""
    photos = db.query(__import__('app.models', fromlist=['Photo']).Photo).filter_by(id=photo_id).first()
    if not photos:
        raise HTTPException(status_code=404, detail="Foto não encontrada")
    shop = BarbershopRepository.get_by_id(db, photos.barbershop_id)
    if not shop or shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão")
    PhotoRepository.delete(db, photos)
