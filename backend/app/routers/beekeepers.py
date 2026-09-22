from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/beekeepers", tags=["beekeepers"])


@router.get("/{beekeeper_id}/profile", response_model=schemas.BeekeeperProfileOut)
def get_profile(beekeeper_id: int, db: Session = Depends(get_db)):
    """
    Powers the beekeeper dashboard header (hive counts, batches this month, etc).

    Ungated (unlike POST /batches or /admin/*) — see the root README's "Auth" section.
    Once phone+OTP login exists, this should read the beekeeper id from the session
    instead of taking it as a path param.
    """
    beekeeper = db.get(models.Beekeeper, beekeeper_id)
    if not beekeeper:
        raise HTTPException(status_code=404, detail="Beekeeper not found")
    return beekeeper
