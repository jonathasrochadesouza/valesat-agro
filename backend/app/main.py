from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed import seed_default_fields
from app.routers import fields, satellite, health

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        seed_default_fields(db)
        db.close()
        print("ValeSat Agro Database initialized and seeded successfully.")
    except Exception as e:
        print(f"Database initialization note: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Plataforma de Monitoramento Satelital de Precisão no Vale do Itajaí (SC) com Sentinel-2 e CBERS-4A WPM.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(fields.router)
app.include_router(satellite.router)

@app.get("/")
def root():
    return {
        "app": "ValeSat Agro",
        "region": "Vale do Itajaí - SC",
        "docs": "/docs",
        "health": "/api/health"
    }
