from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import blockchain, models, schemas
from app.auth import require_api_key
from app.database import get_db

router = APIRouter(prefix="/batches", tags=["batches"])

MAX_BATCH_ID_ATTEMPTS = 5


def _generate_batch_id(db: Session, hive: models.Hive, offset: int = 0) -> str:
    state_code = hive.cluster.split(",")[-1].strip()[:2].upper() or "XX"
    year = 2026
    count = db.query(models.Batch).count() + 1 + offset
    return f"HC-{state_code}-{year}-{count:05d}"


@router.get("", response_model=list[schemas.BatchOut])
def list_batches(db: Session = Depends(get_db)):
    return db.query(models.Batch).all()


@router.get("/{batch_id}", response_model=schemas.BatchOut)
def get_batch(batch_id: str, db: Session = Depends(get_db)):
    batch = db.get(models.Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.post("", response_model=schemas.BatchOut, status_code=201, dependencies=[Depends(require_api_key)])
def create_batch(payload: schemas.BatchCreate, db: Session = Depends(get_db)):
    hive = db.get(models.Hive, payload.hive_id)
    if not hive:
        raise HTTPException(status_code=404, detail="Hive not found")

    # Retry on a colliding ID (two requests landing on the same count-based
    # suffix) rather than trusting the count read above to still be unique by
    # the time this commits.
    for attempt in range(MAX_BATCH_ID_ATTEMPTS):
        batch = models.Batch(
            id=_generate_batch_id(db, hive, offset=attempt),
            hive_id=hive.id,
            hive_name=f"{hive.name}, {hive.cluster}",
            beekeeper_id=hive.beekeeper_id,
            location=hive.cluster,
            extraction_date=payload.extraction_date,
            quantity_kg=payload.quantity_kg,
            status="In progress",
            authenticity_score=0,
        )
        batch.events.append(
            models.BatchEvent(label="Batch created", date=payload.extraction_date, verified=True)
        )
        db.add(batch)
        try:
            db.flush()  # assigns batch.id-backed relations before the chain write below
            break
        except IntegrityError:
            db.rollback()
    else:
        raise HTTPException(status_code=409, detail="Could not allocate a unique batch ID, try again")

    receipt = blockchain.record_batch(
        batch_id=batch.id,
        extraction_date=payload.extraction_date,
        quantity_kg=payload.quantity_kg,
    )
    batch.tx_hash = receipt.tx_hash
    batch.block_number = receipt.block_number
    batch.network = receipt.network
    batch.status = "Verified"
    batch.authenticity_score = 94

    db.commit()
    db.refresh(batch)
    return batch


@router.post("/{batch_id}/events", response_model=schemas.BatchOut, dependencies=[Depends(require_api_key)])
def add_batch_event(batch_id: str, payload: schemas.BatchEventCreate, db: Session = Depends(get_db)):
    batch = db.get(models.Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    batch.events.append(models.BatchEvent(label=payload.label, date=payload.date, verified=payload.verified))
    blockchain.record_event(batch.id, payload.label, payload.date)
    db.commit()
    db.refresh(batch)
    return batch


@router.get("/{batch_id}/verify", response_model=schemas.VerifyResultOut)
def verify_batch(batch_id: str, db: Session = Depends(get_db)):
    """Consumer-facing QR scan lookup — used by the /verify/[id] page."""
    batch = db.get(models.Batch, batch_id)
    if not batch:
        return schemas.VerifyResultOut(found=False)

    chain_confirmed = blockchain.verify_batch_on_chain(
        batch.id, batch.extraction_date, batch.quantity_kg, batch.tx_hash
    )
    return schemas.VerifyResultOut(found=True, batch=batch, chain_confirmed=chain_confirmed)
