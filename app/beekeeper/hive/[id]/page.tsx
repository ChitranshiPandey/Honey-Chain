import { notFound } from "next/navigation";
import { getHive } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import HiveTrendChart from "@/components/HiveTrendChart";
import { WifiOff, ThermometerSun, Droplets, Scale, Activity } from "lucide-react";

export default async function HiveMonitoringPage({ params }: { params: { id: string } }) {
  const hive = await getHive(params.id);
  if (!hive) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-3xl">{hive.name}</h1>
        <StatusBadge status={hive.status} />
      </div>
      <div className="text-muted text-sm mb-8">{hive.cluster}</div>

      {hive.isOffline && (
        <div className="bg-alert-tint border border-alert/20 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <WifiOff size={18} className="text-alert shrink-0" />
          <div className="text-sm text-ink/80">
            <span className="font-medium text-alert">No recent data.</span> Last synced {hive.lastSynced}. The
            ESP32 buffers readings locally and will sync automatically once it reconnects.
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-black/5 rounded-2xl p-5">
          <ThermometerSun size={18} className="text-primary" />
          <div className="font-display text-2xl mt-3">{hive.temperature}°C</div>
          <div className="text-muted text-xs mt-1">Temperature</div>
        </div>
        <div className="bg-white border border-black/5 rounded-2xl p-5">
          <Droplets size={18} className="text-primary" />
          <div className="font-display text-2xl mt-3">{hive.humidity}%</div>
          <div className="text-muted text-xs mt-1">Humidity</div>
        </div>
        <div className="bg-white border border-black/5 rounded-2xl p-5">
          <Scale size={18} className="text-primary" />
          <div className="font-display text-2xl mt-3">{hive.weightKg} kg</div>
          <div className="text-muted text-xs mt-1">Hive weight</div>
        </div>
        <div className="bg-white border border-black/5 rounded-2xl p-5">
          <Activity size={18} className="text-primary" />
          <div className="font-display text-2xl mt-3">{hive.activity}</div>
          <div className="text-muted text-xs mt-1">Activity level</div>
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl p-6 mb-8">
        <div className="text-sm font-medium mb-4">Temperature & weight — last 24 hours</div>
        <HiveTrendChart data={hive.trend} />
      </div>

      <div
        className={`rounded-2xl p-6 ${
          hive.status === "healthy" ? "bg-trust-tint" : hive.status === "attention" ? "bg-gold-tint" : "bg-alert-tint"
        }`}
      >
        <div className="text-xs font-medium uppercase tracking-wide text-ink/50 mb-2">AI insight</div>
        <div className="font-medium text-ink mb-1">{hive.aiReason}</div>
        <div className="text-sm text-ink/70">{hive.aiAction}</div>
        <div className="text-xs text-ink/40 mt-4">Risk indicator based on sensor patterns — not a lab diagnosis.</div>
      </div>
    </div>
  );
}
