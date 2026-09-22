"""
Rule-based hive health insight — computed live from sensor readings.

Not a trained model: there's no labeled failure dataset for these hives to
train one on, so this encodes the same temperature/activity/weight
thresholds a beekeeper would check manually. It's real in the sense that it
reacts to the actual numbers (change a hive's readings, the insight changes
with it) rather than being fixed prose per hive. A trained model is a
drop-in replacement later — see README "Next steps" — nothing else in the
app needs to change, callers only see `reason` / `action` strings.
"""

from dataclasses import dataclass

HIGH_TEMP_C = 35.0
CRITICAL_TEMP_C = 37.0
WEIGHT_DROP_KG = 0.5


@dataclass(frozen=True)
class Insight:
    reason: str
    action: str


def compute_insight(
    *,
    temperature: float,
    activity: str,
    is_offline: bool,
    last_synced: str,
    trend_weights: list[float],
) -> Insight:
    if is_offline:
        return Insight(
            reason=f"No data received {last_synced} — device likely offline.",
            action="Check ESP32 power and Wi-Fi connection at the hive site.",
        )

    weight_trend_down = len(trend_weights) >= 2 and (trend_weights[0] - trend_weights[-1]) >= WEIGHT_DROP_KG

    if temperature >= CRITICAL_TEMP_C:
        return Insight(
            reason=f"Temperature critically high at {temperature:.1f}°C.",
            action="Inspect immediately — risk of colony overheating.",
        )

    if temperature >= HIGH_TEMP_C and (activity == "Low" or weight_trend_down):
        return Insight(
            reason="Temperature elevated while activity and weight trend down.",
            action="Inspect hive within 24 hours for possible colony stress.",
        )

    if weight_trend_down and activity == "Low":
        return Insight(
            reason="Weight declining alongside low activity — possible foraging shortage.",
            action="Inspect hive within 24 hours for possible colony stress.",
        )

    return Insight(
        reason="All readings within normal seasonal range.",
        action="No action needed — continue routine checks.",
    )
