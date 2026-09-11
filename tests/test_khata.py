import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import User, Customer, Transaction, Expense

# Setup In-Memory Test Database with StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_register_and_login():
    # Register
    reg_payload = {
        "business_name": "Al-Rehman General Store",
        "owner_name": "Tariq Mahmood",
        "email": "tariq@khata.com",
        "phone": "03001234567",
        "password": "secretpassword123"
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["business_name"] == "Al-Rehman General Store"

    token = data["access_token"]

    # Login
    login_payload = {
        "email": "tariq@khata.com",
        "password": "secretpassword123"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Get Profile
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["owner_name"] == "Tariq Mahmood"

def test_customer_and_balance_calculation():
    today = datetime.now().strftime("%Y-%m-%d")
    # Register user
    reg_payload = {
        "business_name": "Khan Auto Spares",
        "owner_name": "Ali Khan",
        "email": "ali@khanautos.com",
        "password": "password123"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Customer with opening balance 1,000 PKR
    cust_payload = {
        "name": "Kamran Electronics",
        "phone": "03129876543",
        "address": "Gawalmandi, Lahore",
        "opening_balance": 1000.0,
        "notes": "VIP customer"
    }
    cust_res = client.post("/api/customers", json=cust_payload, headers=headers)
    assert cust_res.status_code == 200
    cust_id = cust_res.json()["id"]
    assert cust_res.json()["current_balance"] == 1000.0

    # 2. Add Udhaar (Credit) of 5,000 PKR => Balance should become 6,000 PKR
    tx1_payload = {
        "customer_id": cust_id,
        "type": "credit",
        "amount": 5000.0,
        "date": today,
        "payment_method": "Cash",
        "description": "5 Motor Belts"
    }
    tx1_res = client.post("/api/transactions", json=tx1_payload, headers=headers)
    assert tx1_res.status_code == 200
    assert tx1_res.json()["running_balance"] == 6000.0

    # 3. Customer pays 2,000 PKR via JazzCash (Debit) => Balance should become 4,000 PKR
    tx2_payload = {
        "customer_id": cust_id,
        "type": "debit",
        "amount": 2000.0,
        "date": today,
        "payment_method": "JazzCash",
        "description": "Partial payment received"
    }
    tx2_res = client.post("/api/transactions", json=tx2_payload, headers=headers)
    assert tx2_res.status_code == 200
    assert tx2_res.json()["running_balance"] == 4000.0

    # 4. Fetch Customer Ledger Statement
    detail_res = client.get(f"/api/customers/{cust_id}", headers=headers)
    assert detail_res.status_code == 200
    statement = detail_res.json()
    assert statement["customer"]["current_balance"] == 4000.0
    assert statement["customer"]["total_credit"] == 5000.0
    assert statement["customer"]["total_received"] == 2000.0
    assert len(statement["ledger"]) == 2

def test_expenses_and_dashboard_reports():
    today = datetime.now().strftime("%Y-%m-%d")
    # Register user
    reg_payload = {
        "business_name": "Pak Mart",
        "owner_name": "Usman Ghani",
        "email": "usman@pakmart.pk",
        "password": "password123"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add Expenses
    exp1 = client.post("/api/expenses", json={
        "title": "Shop Monthly Rent",
        "category_name": "Rent",
        "amount": 15000.0,
        "date": today,
        "payment_method": "Bank Transfer"
    }, headers=headers)
    assert exp1.status_code == 200

    exp2 = client.post("/api/expenses", json={
        "title": "K-Electric Bill",
        "category_name": "Electricity",
        "amount": 4500.0,
        "date": today,
        "payment_method": "Easypaisa"
    }, headers=headers)
    assert exp2.status_code == 200

    # Dashboard Summary
    dash_res = client.get("/api/dashboard/summary", headers=headers)
    assert dash_res.status_code == 200
    dash = dash_res.json()
    assert dash["todays_expenses"] == 19500.0

def test_user_data_isolation():
    # User 1
    u1_token = client.post("/api/auth/register", json={
        "business_name": "Shop 1", "owner_name": "Owner 1", "email": "u1@test.com", "password": "pass123"
    }).json()["access_token"]

    # User 2
    u2_token = client.post("/api/auth/register", json={
        "business_name": "Shop 2", "owner_name": "Owner 2", "email": "u2@test.com", "password": "pass123"
    }).json()["access_token"]

    # User 1 creates customer
    cust1 = client.post("/api/customers", json={"name": "User 1 Customer"}, headers={"Authorization": f"Bearer {u1_token}"}).json()

    # User 2 attempts to fetch customers -> should NOT see User 1's customer
    u2_custs = client.get("/api/customers", headers={"Authorization": f"Bearer {u2_token}"}).json()
    assert len(u2_custs) == 0

    # User 2 attempts to access User 1 customer details directly -> 404
    u2_detail = client.get(f"/api/customers/{cust1['id']}", headers={"Authorization": f"Bearer {u2_token}"})
    assert u2_detail.status_code == 404

def test_password_reset_flow():
    # Register user
    client.post("/api/auth/register", json={
        "business_name": "Reset Test Store",
        "owner_name": "Reset User",
        "email": "reset@test.com",
        "password": "initial_password_123"
    })

    # 1. Forgot password request
    forgot_res = client.post("/api/auth/forgot-password", json={"email": "reset@test.com"})
    assert forgot_res.status_code == 200
    reset_token = forgot_res.json().get("reset_token")
    assert reset_token is not None

    # 2. Reset password
    new_password = "new_secure_password_456"
    reset_res = client.post("/api/auth/reset-password", json={
        "token": reset_token,
        "new_password": new_password
    })
    assert reset_res.status_code == 200
    assert "successfully" in reset_res.json()["message"]

    # 3. Old password fails
    old_login = client.post("/api/auth/login", json={
        "email": "reset@test.com",
        "password": "initial_password_123"
    })
    assert old_login.status_code == 401

    # 4. New password succeeds
    new_login = client.post("/api/auth/login", json={
        "email": "reset@test.com",
        "password": new_password
    })
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()

def test_settings_backup_and_restore():
    # Register user
    reg = client.post("/api/auth/register", json={
        "business_name": "Backup Shop",
        "owner_name": "Backup User",
        "email": "backup@test.com",
        "password": "password123"
    }).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add a customer
    cust = client.post("/api/customers", json={"name": "Backup Customer", "opening_balance": 500}, headers=headers).json()
    # Add a transaction
    client.post("/api/transactions", json={
        "customer_id": cust["id"],
        "type": "credit",
        "amount": 2500,
        "date": "2026-09-09",
        "payment_method": "Cash"
    }, headers=headers)

    # 1. Download Backup
    backup_res = client.get("/api/settings/backup", headers=headers)
    assert backup_res.status_code == 200
    backup_data = backup_res.json()
    assert "customers" in backup_data
    assert "transactions" in backup_data
    assert len(backup_data["customers"]) == 1
    assert len(backup_data["transactions"]) == 1

    # 2. Restore Backup via multipart upload
    import io
    import json
    backup_bytes = json.dumps(backup_data).encode("utf-8")
    files = {"file": ("backup.json", io.BytesIO(backup_bytes), "application/json")}
    restore_res = client.post("/api/settings/restore", files=files, headers=headers)
    assert restore_res.status_code == 200
    assert "restored" in restore_res.json()["message"].lower()

def test_reports_payables_and_csv_export():
    # Register user
    reg = client.post("/api/auth/register", json={
        "business_name": "CSV Shop",
        "owner_name": "CSV User",
        "email": "csv@test.com",
        "password": "password123"
    }).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add customer with negative balance (payable)
    client.post("/api/customers", json={"name": "Supplier A", "opening_balance": -3000}, headers=headers)

    # Test payables report
    payables_res = client.get("/api/reports/payables", headers=headers)
    assert payables_res.status_code == 200
    assert len(payables_res.json()) >= 1

    # Test payables CSV export
    csv_res = client.get("/api/reports/export/csv?report_type=payables", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Supplier A" in csv_res.text

def test_notifications_endpoints():
    # Register user
    reg = client.post("/api/auth/register", json={
        "business_name": "Notif Shop",
        "owner_name": "Notif User",
        "email": "notif@test.com",
        "password": "password123"
    }).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch notifications
    notifs_res = client.get("/api/notifications", headers=headers)
    assert notifs_res.status_code == 200
    data = notifs_res.json()
    assert "unread_count" in data
    assert "notifications" in data

    # Mark all as read
    read_all = client.put("/api/notifications/read-all", headers=headers)
    assert read_all.status_code == 200

def test_receipt_upload():
    # Register user
    reg = client.post("/api/auth/register", json={
        "business_name": "Receipt Shop",
        "owner_name": "Receipt User",
        "email": "receipt@test.com",
        "password": "password123"
    }).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload mock receipt
    import io
    file_content = b"fake image content for testing receipt upload"
    files = {"file": ("receipt.png", io.BytesIO(file_content), "image/png")}

    upload_res = client.post("/api/transactions/receipt-upload", files=files, headers=headers)
    assert upload_res.status_code == 200
    data = upload_res.json()
    assert "receipt_url" in data
    assert data["receipt_url"].startswith("/uploads/")

