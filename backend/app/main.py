from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.routers import auth, employees, locations
from app.database.database import engine

app = FastAPI(
    title="Cybatech Workforce API",
    description="Location-aware workforce attendance management API",
    version="0.1.0"
)

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(locations.router)


@app.get("/")
def home():
    return {
        "message": "Cybatech Workforce API is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/api/database-check")
def database_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "database": "connected"
        }
    except Exception as error:
        return {
            "database": "connection failed",
            "error": str(error)
        }
