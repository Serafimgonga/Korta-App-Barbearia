from fastapi import APIRouter, Depends, status, File, UploadFile, Form, Request, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import ServicePhoto, ServicePhotoCreate, ServicePhotoUpdate, ServiceResponse
from app.services import ServicePhotoService, ServiceService
from app.utils.dependencies import get_current_user, require_barber
from app.models import User
from app.repositories import ServiceRepository, BarbershopRepository
from typing import List, Optional
import uuid
import shutil

router = APIRouter(prefix="/services", tags=["Service Photos"])


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service_details(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Obtém detalhes de um serviço específico, incluindo as fotos associadas."""
    return ServiceService.get_details(db, service_id)


@router.get("/{service_id}/photos", response_model=List[ServicePhoto])
def list_service_photos(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Lista todas as fotos associadas a um serviço."""
    return ServicePhotoService.list_by_service(db, service_id)


@router.post("/{service_id}/photos", response_model=ServicePhoto, status_code=201)
def create_service_photo(
    service_id: int,
    data: ServicePhotoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber)
):
    """Associa uma nova foto a um serviço. Apenas para o barbeiro proprietário."""
    return ServicePhotoService.create(db, service_id, data, current_user.id)


@router.post("/{service_id}/photos/upload", response_model=ServicePhoto, status_code=201)
def upload_service_photo(
    request: Request,
    service_id: int,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    display_order: int = Form(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber)
):
    """
    Carrega uma nova foto para um serviço com validações de tamanho (máx. 10MB) e formato (JPG/PNG/WEBP).
    Apenas para o barbeiro proprietário.
    """
    # 1. Validar formato (MIME Type)
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de imagem inválido. Formatos permitidos: {', '.join(allowed_types)}"
        )

    # 2. Validar tamanho máximo (10 MB = 10 * 1024 * 1024 bytes)
    max_size = 10 * 1024 * 1024
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail="O ficheiro excede o tamanho máximo de 10 MB permitido."
        )

    # 3. Validar posse e existência do serviço
    service = ServiceRepository.get_by_id(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
        
    shop = BarbershopRepository.get_by_id(db, service.barbershop_id)
    if not shop or shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para adicionar fotos a este serviço")

    # 4. Gravar o ficheiro em disco com um nome seguro
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"service_{service_id}_{uuid.uuid4().hex}.{ext}"
    filepath = f"media/photos/{unique_filename}"
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 5. Gerar a URL absoluta dinâmica
    photo_url = f"{request.base_url}media/photos/{unique_filename}"

    # 6. Criar o registo no banco de dados
    photo_data = ServicePhotoCreate(
        url=photo_url,
        caption=caption,
        display_order=display_order,
        service_id=service_id,
        shop_id=shop.id
    )
    
    return ServicePhotoService.create(db, service_id, photo_data, current_user.id)


@router.put("/{service_id}/photos/{photo_id}", response_model=ServicePhoto)
def update_service_photo(
    service_id: int,
    photo_id: int,
    data: ServicePhotoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber)
):
    """Atualiza a legenda (caption) ou a ordem de uma foto de serviço."""
    return ServicePhotoService.update(db, photo_id, data, current_user.id)


@router.delete("/{service_id}/photos/{photo_id}", status_code=204)
def delete_service_photo(
    service_id: int,
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_barber)
):
    """Elimina uma foto de serviço. Apenas para o barbeiro proprietário."""
    ServicePhotoService.delete(db, photo_id, current_user.id)
    return None
