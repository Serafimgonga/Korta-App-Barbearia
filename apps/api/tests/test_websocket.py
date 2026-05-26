import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.utils.websocket_manager import notification_manager, send_notification_sync

client = TestClient(app)

def test_websocket_no_token():
    """Testa que conexões WebSocket sem token são rejeitadas."""
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/notifications") as websocket:
            pass

def test_websocket_invalid_token():
    """Testa que conexões WebSocket com token inválido são rejeitadas."""
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/notifications?token=token_invalido_123") as websocket:
            pass

def test_websocket_valid_token_and_message():
    """Testa conexão bem-sucedida com JWT e o envio/recepção de notificações."""
    user_id = 999
    token = create_access_token(user_id)
    
    with client.websocket_connect(f"/ws/notifications?token={token}") as websocket:
        # Enviar mensagem síncrona simulando um evento de matchmaking do dispatcher
        send_notification_sync(user_id, {
            "type": "new_booking_request",
            "request": {
                "id": 42,
                "service_name": "Corte Moderno",
                "price": 2500,
                "radius_km": 5,
                "client_name": "Mário"
            }
        })
        
        # O cliente conectado deve receber a mensagem perfeitamente via JSON
        data = websocket.receive_json()
        assert data["type"] == "new_booking_request"
        assert data["request"]["id"] == 42
        assert data["request"]["service_name"] == "Corte Moderno"
        assert data["request"]["price"] == 2500
        assert data["request"]["client_name"] == "Mário"
