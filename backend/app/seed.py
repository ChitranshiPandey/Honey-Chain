"""
Loads the same records that live in the frontend's lib/mock-data.ts into the
database, so the API returns identical data while the frontend is migrated
from mock imports to real fetch calls.

Run with: python -m app.seed
"""

from app.database import Base, SessionLocal, engine
from app.models import Batch, BatchEvent, Beekeeper, Hive, HiveTrendPoint


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Beekeeper).count() > 0:
            print("Already seeded — skipping. Delete honeychain.db to reseed.")
            return

        ramesh = Beekeeper(
            name="Ramesh Kumar",
            cluster="Bhopal Cluster, Madhya Pradesh",
            total_hives=24,
            healthy_hives=20,
            attention_hives=3,
            critical_hives=1,
            batches_this_month=6,
            honey_produced_kg=184.6,
            verified_batches=142,
            flagged=0,
        )
        others = [
            Beekeeper(name="Sunita Devi", cluster="Indore Cluster", total_hives=18, verified_batches=96, flagged=1),
            Beekeeper(name="Ashok Patil", cluster="Nagpur Cluster", total_hives=31, verified_batches=210, flagged=0),
            Beekeeper(name="Meena Shah", cluster="Indore Cluster", total_hives=12, verified_batches=58, flagged=2),
            Beekeeper(name="Vikram Rathore", cluster="Bhopal Cluster", total_hives=20, verified_batches=133, flagged=0),
        ]
        db.add(ramesh)
        db.add_all(others)
        db.flush()

        hives_data = [
            dict(
                id="H101", name="Hive H101", cluster="Bhopal Cluster", temperature=33.4, humidity=58,
                weight_kg=42.3, activity="Normal", status="healthy",
                ai_reason="All readings within normal seasonal range.",
                ai_action="No action needed — continue routine checks.",
                last_synced="2 minutes ago", is_offline=False,
                trend=[("6am", 31.2, 42.0), ("9am", 32.1, 42.1), ("12pm", 33.8, 42.2), ("3pm", 34.2, 42.3), ("6pm", 33.4, 42.3)],
            ),
            dict(
                id="H102", name="Hive H102", cluster="Bhopal Cluster", temperature=35.8, humidity=61,
                weight_kg=39.7, activity="Low", status="attention",
                ai_reason="Temperature increasing while activity and weight trend down.",
                ai_action="Inspect hive within 24 hours for possible colony stress.",
                last_synced="5 minutes ago", is_offline=False,
                trend=[("6am", 32.0, 40.4), ("9am", 33.4, 40.1), ("12pm", 34.9, 39.9), ("3pm", 35.6, 39.8), ("6pm", 35.8, 39.7)],
            ),
            dict(
                id="H103", name="Hive H103", cluster="Bhopal Cluster", temperature=31.2, humidity=55,
                weight_kg=38.1, activity="Normal", status="healthy",
                ai_reason="Stable readings, consistent with healthy colony activity.",
                ai_action="No action needed.",
                last_synced="1 minute ago", is_offline=False,
                trend=[("6am", 29.8, 37.9), ("9am", 30.6, 38.0), ("12pm", 31.5, 38.0), ("3pm", 31.8, 38.1), ("6pm", 31.2, 38.1)],
            ),
            dict(
                id="H104", name="Hive H104", cluster="Bhopal Cluster", temperature=27.1, humidity=63,
                weight_kg=36.4, activity="Normal", status="critical",
                ai_reason="No data received in over 6 hours — device likely offline.",
                ai_action="Check ESP32 power and Wi-Fi connection at the hive site.",
                last_synced="6 hours ago", is_offline=True,
                trend=[("6am", 28.0, 36.5), ("9am", 27.6, 36.4), ("12pm", 27.1, 36.4), ("3pm", 27.1, 36.4), ("6pm", 27.1, 36.4)],
            ),
        ]

        hive_objs = {}
        for h in hives_data:
            trend = h.pop("trend")
            hive = Hive(**h, beekeeper_id=ramesh.id)
            hive.trend_points = [HiveTrendPoint(time=t, temp=temp, weight=weight) for t, temp, weight in trend]
            db.add(hive)
            hive_objs[hive.id] = hive
        db.flush()

        batch142 = Batch(
            id="HC-MP-2026-00142",
            hive_id="H102",
            hive_name="Hive H102, Madhya Pradesh",
            beekeeper_id=ramesh.id,
            location="Bhopal Cluster, Madhya Pradesh",
            extraction_date="31 Aug 2026",
            quantity_kg=8.2,
            status="Verified",
            authenticity_score=94,
            tx_hash="0x7f2a...c3d9",
            block_number=2784321,
            network="Polygon Amoy",
        )
        batch142.events = [
            BatchEvent(label="Batch created", date="31 Aug 2026, 08:15 AM", verified=True),
            BatchEvent(label="Honey extracted", date="31 Aug 2026, 09:30 AM", verified=True),
            BatchEvent(label="Quality check passed", date="31 Aug 2026, 11:00 AM", verified=True),
            BatchEvent(label="Packaged — 500ml, pure forest honey", date="31 Aug 2026, 02:30 PM", verified=True),
            BatchEvent(label="Dispatched to Bhopal Distributor", date="1 Sep 2026, 10:00 AM", verified=True),
            BatchEvent(label="Delivered to Nature Mart Store", date="2 Sep 2026, 04:30 PM", verified=False),
        ]

        batch141 = Batch(
            id="HC-MP-2026-00141",
            hive_id="H101",
            hive_name="Hive H101, Madhya Pradesh",
            beekeeper_id=ramesh.id,
            location="Bhopal Cluster, Madhya Pradesh",
            extraction_date="29 Aug 2026",
            quantity_kg=6.5,
            status="Verified",
            authenticity_score=97,
            tx_hash="0x51ab...9e2f",
            block_number=2781908,
            network="Polygon Amoy",
        )
        batch141.events = [
            BatchEvent(label="Batch created", date="29 Aug 2026, 07:50 AM", verified=True),
            BatchEvent(label="Honey extracted", date="29 Aug 2026, 09:10 AM", verified=True),
            BatchEvent(label="Quality check passed", date="29 Aug 2026, 10:40 AM", verified=True),
            BatchEvent(label="Packaged — 500ml, pure forest honey", date="29 Aug 2026, 01:15 PM", verified=True),
        ]

        db.add_all([batch142, batch141])
        db.commit()
        print("Seeded database with mock-data.ts equivalent records.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
