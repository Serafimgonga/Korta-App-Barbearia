from fastapi import WebSocket
from typing import Dict, List
import asyncio
import logging

logger = logging.getLogger("websocket")

class WebSocketConnectionManager:
    def __init__(self):
        # Mapeia user_id para uma lista de conexões WebSocket ativas
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        self.active_connections.setdefault(user_id, []).append(websocket)
        logger.info(f"Usuário {user_id} conectado via WebSocket. Conexões ativas: {len(self.active_connections[user_id])}")

    async def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            logger.info(f"Usuário {user_id} desconectado do WebSocket.")

    async def send_to_user(self, user_id: int, data: dict):
        if user_id not in self.active_connections:
            logger.debug(f"Nenhuma conexão ativa para o usuário {user_id}.")
            return

        closed_connections = []
        connections = list(self.active_connections[user_id])
        for websocket in connections:
            try:
                await websocket.send_json(data)
            except Exception as e:
                logger.error(f"Erro ao enviar mensagem via WebSocket para o usuário {user_id}: {e}")
                closed_connections.append(websocket)

        # Limpar conexões falhas
        for ws in closed_connections:
            await self.disconnect(ws, user_id)

    async def broadcast(self, data: dict):
        for user_id, connections in list(self.active_connections.items()):
            closed_connections = []
            for websocket in list(connections):
                try:
                    await websocket.send_json(data)
                except Exception as e:
                    logger.error(f"Erro ao transmitir mensagem via WebSocket para o usuário {user_id}: {e}")
                    closed_connections.append(websocket)
            
            for ws in closed_connections:
                await self.disconnect(ws, user_id)

# Instância única global do gerenciador
notification_manager = WebSocketConnectionManager()

def send_notification_sync(user_id: int, data: dict):
    """Envia uma notificação em tempo real a partir de código síncrono."""
    async def _send():
        await notification_manager.send_to_user(user_id, data)

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Executado dentro de uma thread assíncrona ativa (FastAPI background threads)
            asyncio.ensure_future(_send())
        else:
            loop.run_until_complete(_send())
    except Exception:
        # Cria um loop temporário se nenhum estiver ativo
        loop = asyncio.new_event_loop()
        try:
            loop.run_until_complete(_send())
        finally:
            loop.close()
