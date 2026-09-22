from pydantic import BaseModel, ConfigDict, Field, field_validator


def to_camel(field: str) -> str:
    head, *tail = field.split("_")
    return head + "".join(word.capitalize() for word in tail)


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class TrendPoint(CamelModel):
    time: str
    temp: float
    weight: float


class HiveOut(CamelModel):
    id: str
    name: str
    cluster: str
    temperature: float
    humidity: float
    weight_kg: float
    activity: str
    status: str
    ai_reason: str
    ai_action: str
    last_synced: str
    is_offline: bool
    trend: list[TrendPoint] = []


class BatchEventOut(CamelModel):
    label: str
    date: str
    verified: bool


class BatchEventCreate(CamelModel):
    label: str
    date: str
    verified: bool = False


class BatchOut(CamelModel):
    id: str
    hive_id: str
    hive_name: str
    beekeeper: str
    location: str
    extraction_date: str
    quantity_kg: float
    status: str
    authenticity_score: int
    events: list[BatchEventOut] = []
    tx_hash: str | None = None
    block_number: int | None = None
    network: str | None = None


MAX_BATCH_QUANTITY_KG = 1000


class BatchCreate(CamelModel):
    hive_id: str
    extraction_date: str
    quantity_kg: float = Field(gt=0, le=MAX_BATCH_QUANTITY_KG)

    @field_validator("extraction_date")
    @classmethod
    def extraction_date_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("extraction_date must not be blank")
        return value


class BeekeeperProfileOut(CamelModel):
    name: str
    cluster: str
    total_hives: int
    healthy_hives: int
    attention_hives: int
    critical_hives: int
    batches_this_month: int
    honey_produced_kg: float


class ClusterBeekeeperOut(CamelModel):
    name: str
    cluster: str
    hives: int
    verified_batches: int
    flagged: int


class ClusterStatsOut(CamelModel):
    total_beekeepers: int
    total_hives: int
    verified_batches: int
    flagged_records: int
    honey_produced_kg_this_month: float


class VerifyResultOut(CamelModel):
    found: bool
    batch: BatchOut | None = None
    chain_confirmed: bool = False
