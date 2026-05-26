from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.utils.websocket_manager import notification_manager
import logging

logger = logging.getLogger("websocket")

router = APIRouter(tags=["Notifications"])

@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    # Obter token de query string
    token = websocket.query_params.get("token")
    if not token:
        logger.warning("Conexão WebSocket rejeitada: token ausente.")
        await websocket.close(code=4003)  # Código HTTP 403 / Forbidden para WebSocket
        return

    # Validar token e extrair user_id
    try:
        payload = decode_token(token)
        user_id = int(payload["sub"])
    except Exception as e:
        logger.warning(f"Conexão WebSocket rejeitada: token inválido. {e}")
        await websocket.close(code=4003)
        return

    # Aceitar a conexão e registrar no gerenciador
    await websocket.accept()
    await notification_manager.connect(websocket, user_id)

    try:
        while True:
            # Mantém a conexão aberta e responde a mensagens de ping ou controle
            # Normalmente, WebSockets de notificações são apenas de envio do servidor para o cliente,
            # mas precisamos ouvir para detectar desconexões do cliente.
            data = await websocket.receive_text()
            # Se o cliente enviar algo, podemos ignorar ou usar para debugging
            logger.debug(f"Mensagem recebida do usuário {user_id}: {data}")
    except WebSocketDisconnect:
        await notification_manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"Erro inesperado na conexão WebSocket do usuário {user_id}: {e}")
        await notification_manager.disconnect(websocket, user_id)
