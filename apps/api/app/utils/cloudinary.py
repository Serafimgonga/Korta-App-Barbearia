import cloudinary
import cloudinary.uploader
from app.core.config import settings

# Configuração do Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_image(file_path_or_obj, folder="korta/barbershops"):
    """
    Faz upload de uma imagem para o Cloudinary.
    Retorna um dicionário com a URL e o public_id.
    """
    try:
        upload_result = cloudinary.uploader.upload(
            file_path_or_obj,
            folder=folder,
            resource_type="image"
        )
        return {
            "url": upload_result.get("secure_url"),
            "public_id": upload_result.get("public_id")
        }
    except Exception as e:
        print(f"Erro no upload para Cloudinary: {e}")
        return None

def delete_image(public_id):
    """
    Remove uma imagem do Cloudinary.
    """
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"Erro ao deletar imagem no Cloudinary: {e}")
        return False
