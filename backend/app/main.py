import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import admin, batches, beekeepers, hives

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Honey Chain API", version="0.1.0")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hives.router)
app.include_router(batches.router)
app.include_router(beekeepers.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
