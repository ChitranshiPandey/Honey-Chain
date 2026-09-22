from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.insight import compute_insight

router = APIRouter(prefix="/hives", tags=["hives"])


def _with_live_insight(hive: models.Hive) -> models.Hive:
    """Overrides the seeded ai_reason/ai_action with a live, threshold-driven
    read of this hive's current metrics. Not persisted — the request's DB
    session is never committed here."""
    insight = compute_insight(
        temperature=hive.temperature,
        activity=hive.activity,
        is_offline=hive.is_offline,
        last_synced=hive.last_synced,
        trend_weights=[p.weight for p in hive.trend_points],
    )
    hive.ai_reason = insight.reason
    hive.ai_action = insight.action
    return hive


@router.get("", response_model=list[schemas.HiveOut])
def list_hives(db: Session = Depends(get_db)):
    return [_with_live_insight(hive) for hive in db.query(models.Hive).all()]


@router.get("/{hive_id}", response_model=schemas.HiveOut)
def get_hive(hive_id: str, db: Session = Depends(get_db)):
    hive = db.get(models.Hive, hive_id)
    if not hive:
        raise HTTPException(status_code=404, detail="Hive not found")
    return _with_live_insight(hive)
