import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db
from app.models import User, Review, Service

client = TestClient(app)

# Global variables to share states between tests
barber_token = None
client_token = None
active_shop_token = None
first_barbershop_id = None
created_service_id = None
created_photo_id = None


def test_public_barbershops():
    """Test listing public barbershops (unauthenticated)."""
    global first_barbershop_id
    response = client.get("/api/v1/barbershops")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    items = data["items"]
    assert isinstance(items, list)
    if len(items) > 0:
        first_barbershop_id = items[0]["id"]
        # Test public shop detail
        detail_resp = client.get(f"/api/v1/barbershops/{first_barbershop_id}")
        assert detail_resp.status_code == 200
        assert detail_resp.json()["id"] == first_barbershop_id


def test_barber_login():
    """Test login for the barber."""
    global barber_token
    payload = {
        "email": "serafim@korta.ao",
        "password": "korta123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    barber_token = data["access_token"]


def test_client_login():
    """Test login for a client."""
    global client_token
    payload = {
        "email": "abel@gmail.com",
        "password": "korta123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    client_token = data["access_token"]


def test_get_me():
    """Test GET /users/me using authenticated tokens."""
    # Barber profile
    headers = {"Authorization": f"Bearer {barber_token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "serafim@korta.ao"

    # Client profile
    headers = {"Authorization": f"Bearer {client_token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "abel@gmail.com"


def test_get_my_barbershops():
    """Test retrieving shops owned by the barber."""
    headers = {"Authorization": f"Bearer {barber_token}"}
    response = client.get("/api/v1/barbershops/mine", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_switch_active_shop():
    """Test switching active barbershop and getting a new JWT."""
    global active_shop_token, first_barbershop_id
    headers = {"Authorization": f"Bearer {barber_token}"}
    
    # First get own shops to get a valid ID if not set
    if not first_barbershop_id:
        mine_resp = client.get("/api/v1/barbershops/mine", headers=headers)
        first_barbershop_id = mine_resp.json()[0]["id"]

    payload = {"shop_id": first_barbershop_id}
    response = client.post("/api/v1/barbershops/switch", headers=headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    active_shop_token = data["access_token"]


def test_get_active_bookings_no_active_shop():
    """Test GET /bookings fails without active shop in token."""
    headers = {"Authorization": f"Bearer {barber_token}"}
    response = client.get("/api/v1/bookings", headers=headers)
    # Without active_shop_id in JWT payload, get_active_shop throws 400 Bad Request
    assert response.status_code == 400


def test_get_active_bookings_with_active_shop():
    """Test GET /bookings succeeds using the switched active shop token."""
    headers = {"Authorization": f"Bearer {active_shop_token}"}
    response = client.get("/api/v1/bookings", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_active_services_crud():
    """Test CRUD of services for the active shop."""
    global created_service_id
    headers = {"Authorization": f"Bearer {active_shop_token}"}

    # 1. List active services
    response = client.get("/api/v1/barbershops/active/services", headers=headers)
    assert response.status_code == 200
    initial_count = len(response.json())

    # 2. Create a service
    new_service = {
        "name": "Serviço de Teste Automático",
        "description": "Criado durante testes do pytest",
        "price": 3000,
        "duration_minutes": 45
    }
    create_resp = client.post("/api/v1/barbershops/active/services", headers=headers, json=new_service)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    assert created_data["name"] == "Serviço de Teste Automático"
    created_service_id = created_data["id"]

    # 3. Verify count increased
    list_resp = client.get("/api/v1/barbershops/active/services", headers=headers)
    assert len(list_resp.json()) == initial_count + 1

    # 4. Clean up service from database
    db = next(get_db())
    try:
        db.query(Service).filter(Service.id == created_service_id).delete()
        db.commit()
    finally:
        db.close()


def test_client_bookings():
    """Test GET /bookings/me for authenticated clients."""
    headers = {"Authorization": f"Bearer {client_token}"}
    response = client.get("/api/v1/bookings/me", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_barbershop_reviews():
    """Test retrieving and posting reviews."""
    global first_barbershop_id
    
    # Clean up any existing review by the test client for this shop so the test is reproducible
    db = next(get_db())
    try:
        client_user = db.query(User).filter(User.email == "abel@gmail.com").first()
        if client_user and first_barbershop_id:
            db.query(Review).filter(
                Review.user_id == client_user.id,
                Review.barbershop_id == first_barbershop_id
            ).delete()
            db.commit()
    finally:
        db.close()

    # 1. Retrieve reviews for the shop
    response = client.get(f"/api/v1/reviews/barbershop/{first_barbershop_id}")
    assert response.status_code == 200
    assert "items" in response.json()

    # 2. Post a review
    headers = {"Authorization": f"Bearer {client_token}"}
    new_review = {
        "barbershop_id": first_barbershop_id,
        "rating": 5,
        "comment": "Avaliação de teste automático por pytest."
    }
    post_resp = client.post("/api/v1/reviews", headers=headers, json=new_review)
    assert post_resp.status_code == 201
    assert post_resp.json()["comment"] == "Avaliação de teste automático por pytest."

    # Clean up review after test
    db = next(get_db())
    try:
        client_user = db.query(User).filter(User.email == "abel@gmail.com").first()
        if client_user and first_barbershop_id:
            db.query(Review).filter(
                Review.user_id == client_user.id,
                Review.barbershop_id == first_barbershop_id
            ).delete()
            db.commit()
    finally:
        db.close()


def test_barbershop_photos():
    """Test listing and uploading photos by URL."""
    global first_barbershop_id, created_photo_id

    # 1. List photos
    response = client.get(f"/api/v1/photos/barbershop/{first_barbershop_id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # 2. Add photo by URL
    headers = {"Authorization": f"Bearer {barber_token}"}
    new_photo = {
        "barbershop_id": first_barbershop_id,
        "url": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
        "public_id": "test_public_id",
        "photo_type": "haircut",
        "caption": "Foto de teste por pytest"
    }
    post_resp = client.post("/api/v1/photos", headers=headers, json=new_photo)
    assert post_resp.status_code == 201
    created_photo_id = post_resp.json()["id"]

    # 3. Delete photo
    del_resp = client.delete(f"/api/v1/photos/{created_photo_id}", headers=headers)
    assert del_resp.status_code == 204
