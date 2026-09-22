import os

# Must be set before app.database / app.blockchain are imported anywhere.
# DATABASE_URL keeps the suite off the real honeychain.db; the three
# POLYGON_* vars are forced blank so tests always run against blockchain.py's
# stub, never the real chain configured in backend/.env (a local Hardhat node
# that may not even be running when tests run, e.g. in CI). Plain assignment,
# not setdefault, so this wins over whatever backend/.env has set.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_honeychain.db")
os.environ.setdefault("API_KEY", "test-api-key")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:3000")
os.environ["POLYGON_RPC_URL"] = ""
os.environ["POLYGON_PRIVATE_KEY"] = ""
os.environ["POLYGON_CONTRACT_ADDRESS"] = ""

import pytest
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Beekeeper, Hive


@pytest.fixture(autouse=True)
def _fresh_db():
    """Creates a clean schema with one beekeeper + one hive before each test."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        beekeeper = Beekeeper(name="Test Beekeeper", cluster="Test Cluster, Test State", total_hives=1)
        db.add(beekeeper)
        db.flush()
        db.add(
            Hive(
                id="H001",
                name="Hive H001",
                cluster="Test Cluster",
                temperature=32.0,
                humidity=55.0,
                weight_kg=40.0,
                activity="Normal",
                status="healthy",
                ai_reason="seed",
                ai_action="seed",
                last_synced="1 minute ago",
                is_offline=False,
                beekeeper_id=beekeeper.id,
            )
        )
        db.commit()
    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)
