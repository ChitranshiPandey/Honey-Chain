import Link from "next/link";
import { ArrowUpRight, AlertTriangle, ChevronRight } from "lucide-react";
import { beekeeperProfile, hives } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

export default function BeekeeperDashboard() {
  const attentionHives = hives.filter((h) => h.status !== "healthy");

  return (
    <div className="max-w-6xl mx-auto px-10 py-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-muted text-sm">Good afternoon,</div>
          <h1 className="font-display text-3xl mt-1">{beekeeperProfile.name}</h1>
        </div>
        <Link
          href="/beekeeper/batch/new"
          className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          + Create honey batch
        </Link>
      </div>

      {/* hero stat + supporting stats */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        <div className="col-span-1 bg-ink text-white rounded-2xl p-7">
          <div className="text-white/60 text-sm">Honey produced this month</div>
          <div className="font-display text-5xl mt-3">{beekeeperProfile.honeyProducedKg}</div>
          <div className="text-gold text-sm mt-1">kilograms</div>
          <div className="flex items-center gap-1 text-trust-tint text-xs mt-4">
            <ArrowUpRight size={14} className="text-trust-tint" />
            <span className="text-white/70">12% more than last month</span>
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-5">
          <div className="bg-white border border-black/5 rounded-2xl p-6">
            <div className="text-muted text-sm">Total hives</div>
            <div className="font-display text-3xl mt-2">{beekeeperProfile.totalHives}</div>
          </div>
          <div className="bg-trust-tint rounded-2xl p-6">
            <div className="text-trust-dark text-sm">Healthy hives</div>
            <div className="font-display text-3xl mt-2 text-trust-dark">{beekeeperProfile.healthyHives}</div>
          </div>
          <div className="bg-gold-tint rounded-2xl p-6">
            <div className="text-gold-dark text-sm">Needs attention</div>
            <div className="font-display text-3xl mt-2 text-gold-dark">
              {beekeeperProfile.attentionHives + beekeeperProfile.criticalHives}
            </div>
          </div>
          <div className="col-span-3 bg-white border border-black/5 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <div className="text-muted text-sm">Batches created this month</div>
              <div className="font-display text-3xl mt-2">{beekeeperProfile.batchesThisMonth}</div>
            </div>
            <Link
              href="/beekeeper/batch/HC-MP-2026-00142"
              className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View latest batch <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* alert banner */}
      {attentionHives.length > 0 && (
        <div className="bg-alert-tint border border-alert/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
          <AlertTriangle size={20} className="text-alert mt-0.5 shrink-0" />
          <div>
            <div className="font-medium text-alert">
              {attentionHives.length} {attentionHives.length === 1 ? "hive needs" : "hives need"} your attention
            </div>
            <div className="text-sm text-ink/70 mt-1">
              {attentionHives.map((h) => h.name).join(" and ")} — {attentionHives[0].aiAction.toLowerCase()}
            </div>
          </div>
        </div>
      )}

      {/* hive list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl">Your hives</h2>
      </div>
      <div className="bg-white border border-black/5 rounded-2xl divide-y divide-black/5">
        {hives.map((hive) => (
          <Link
            key={hive.id}
            href={`/beekeeper/hive/${hive.id}`}
            className="flex items-center justify-between px-6 py-4 hover:bg-primary-tint/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="font-medium w-24">{hive.name}</div>
              <div className="text-sm text-muted">{hive.temperature}°C</div>
              <div className="text-sm text-muted">{hive.humidity}% humidity</div>
              <div className="text-sm text-muted">{hive.weightKg} kg</div>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={hive.status} />
              <ChevronRight size={16} className="text-muted" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
