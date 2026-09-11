from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.database import engine, Base
from app.config import UPLOAD_DIR, BASE_DIR
from app.routes import (
    auth_routes,
    customer_routes,
    transaction_routes,
    expense_routes,
    report_routes,
    notification_routes,
    settings_routes,
    dashboard_routes
)

# Auto-create SQLite database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Khata Management API",
    description="Backend API for Khata Management & Accounting Application for Pakistan Businesses",
    version="1.0.0"
)

# Enable CORS for local & production access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_routes.router)
app.include_router(customer_routes.router)
app.include_router(transaction_routes.router)
app.include_router(expense_routes.router)
app.include_router(report_routes.router)
app.include_router(notification_routes.router)
app.include_router(settings_routes.router)
app.include_router(dashboard_routes.router)

# Mount Uploads directory for receipt & logo files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Mount Static directory for Frontend UI
STATIC_DIR = os.path.join(BASE_DIR, "app", "static")

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

    @app.get("/")
    def serve_spa():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
