from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import require_api_key
from app.database import get_db

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_api_key)])


@router.get("/beekeepers", response_model=list[schemas.ClusterBeekeeperOut])
def list_cluster_beekeepers(db: Session = Depends(get_db)):
    return db.query(models.Beekeeper).all()


@router.get("/stats", response_model=schemas.ClusterStatsOut)
def cluster_stats(db: Session = Depends(get_db)):
    total_beekeepers = db.query(func.count(models.Beekeeper.id)).scalar() or 0
    total_hives = db.query(func.count(models.Hive.id)).scalar() or 0
    verified_batches = (
        db.query(func.count(models.Batch.id)).filter(models.Batch.status == "Verified").scalar() or 0
    )
    flagged_records = db.query(func.sum(models.Beekeeper.flagged)).scalar() or 0
    honey_this_month = db.query(func.sum(models.Beekeeper.honey_produced_kg)).scalar() or 0

    return schemas.ClusterStatsOut(
        total_beekeepers=total_beekeepers,
        total_hives=total_hives,
        verified_batches=verified_batches,
        flagged_records=flagged_records,
        honey_produced_kg_this_month=honey_this_month,
    )
