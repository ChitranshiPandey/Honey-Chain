from sqlalchemy import Boolean, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Beekeeper(Base):
    __tablename__ = "beekeepers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    cluster: Mapped[str] = mapped_column(String)
    total_hives: Mapped[int] = mapped_column(Integer, default=0)
    healthy_hives: Mapped[int] = mapped_column(Integer, default=0)
    attention_hives: Mapped[int] = mapped_column(Integer, default=0)
    critical_hives: Mapped[int] = mapped_column(Integer, default=0)
    batches_this_month: Mapped[int] = mapped_column(Integer, default=0)
    honey_produced_kg: Mapped[float] = mapped_column(Float, default=0)
    verified_batches: Mapped[int] = mapped_column(Integer, default=0)
    flagged: Mapped[int] = mapped_column(Integer, default=0)

    owned_hives: Mapped[list["Hive"]] = relationship(back_populates="beekeeper")
    batches: Mapped[list["Batch"]] = relationship(back_populates="beekeeper_ref")

    @property
    def hives(self) -> int:
        """Hive count — schemas.ClusterBeekeeperOut expects a flat number here."""
        return self.total_hives


class Hive(Base):
    __tablename__ = "hives"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # e.g. "H101"
    name: Mapped[str] = mapped_column(String)
    cluster: Mapped[str] = mapped_column(String)
    temperature: Mapped[float] = mapped_column(Float)
    humidity: Mapped[float] = mapped_column(Float)
    weight_kg: Mapped[float] = mapped_column(Float)
    activity: Mapped[str] = mapped_column(String)  # Low | Normal | High
    status: Mapped[str] = mapped_column(String)  # healthy | attention | critical
    ai_reason: Mapped[str] = mapped_column(String)
    ai_action: Mapped[str] = mapped_column(String)
    last_synced: Mapped[str] = mapped_column(String)
    is_offline: Mapped[bool] = mapped_column(Boolean, default=False)

    beekeeper_id: Mapped[int] = mapped_column(ForeignKey("beekeepers.id"))
    beekeeper: Mapped["Beekeeper"] = relationship(back_populates="owned_hives")

    trend_points: Mapped[list["HiveTrendPoint"]] = relationship(
        back_populates="hive", cascade="all, delete-orphan"
    )

    @property
    def trend(self) -> list["HiveTrendPoint"]:
        """schemas.HiveOut expects this field name (matches lib/mock-data.ts)."""
        return self.trend_points


class HiveTrendPoint(Base):
    __tablename__ = "hive_trend_points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hive_id: Mapped[str] = mapped_column(ForeignKey("hives.id"))
    time: Mapped[str] = mapped_column(String)  # e.g. "6am"
    temp: Mapped[float] = mapped_column(Float)
    weight: Mapped[float] = mapped_column(Float)

    hive: Mapped["Hive"] = relationship(back_populates="trend_points")


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # e.g. "HC-MP-2026-00142"
    hive_id: Mapped[str] = mapped_column(ForeignKey("hives.id"))
    hive_name: Mapped[str] = mapped_column(String)
    beekeeper_id: Mapped[int] = mapped_column(ForeignKey("beekeepers.id"))
    location: Mapped[str] = mapped_column(String)
    extraction_date: Mapped[str] = mapped_column(String)
    quantity_kg: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String, default="In progress")  # In progress | Verified
    authenticity_score: Mapped[int] = mapped_column(Integer, default=0)

    # Filled in by app/blockchain.py when the batch is recorded on-chain
    tx_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    block_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    network: Mapped[str | None] = mapped_column(String, nullable=True)

    hive: Mapped["Hive"] = relationship()
    beekeeper_ref: Mapped["Beekeeper"] = relationship(back_populates="batches")
    events: Mapped[list["BatchEvent"]] = relationship(
        back_populates="batch", cascade="all, delete-orphan", order_by="BatchEvent.id"
    )

    @property
    def beekeeper(self) -> str:
        """Beekeeper's display name — schemas.BatchOut expects a flat string."""
        return self.beekeeper_ref.name


class BatchEvent(Base):
    __tablename__ = "batch_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[str] = mapped_column(ForeignKey("batches.id"))
    label: Mapped[str] = mapped_column(String)
    date: Mapped[str] = mapped_column(String)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)

    batch: Mapped["Batch"] = relationship(back_populates="events")
