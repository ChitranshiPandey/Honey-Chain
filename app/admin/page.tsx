import Link from "next/link";
import { ArrowLeft, Flag } from "lucide-react";
import { clusterBeekeepers, clusterStats } from "@/lib/mock-data";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="bg-ink text-white px-10 py-6">
        <Link href="/" className="flex items-center gap-2 text-white/50 text-xs mb-4 hover:text-white transition-colors w-fit">
          <ArrowLeft size={14} />
          Back to Honey Chain
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-2xl">KVIC cluster dashboard</div>
            <div className="text-white/50 text-sm mt-1">Madhya Pradesh region &middot; live overview</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 py-10">
        <div className="grid grid-cols-5 gap-4 mb-10">
          <div className="bg-white border border-black/5 rounded-2xl p-5">
            <div className="font-display text-2xl">{clusterStats.totalBeekeepers}</div>
            <div className="text-muted text-xs mt-1">Registered beekeepers</div>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-5">
            <div className="font-display text-2xl">{clusterStats.totalHives}</div>
            <div className="text-muted text-xs mt-1">Total hives</div>
          </div>
          <div className="bg-trust-tint rounded-2xl p-5">
            <div className="font-display text-2xl text-trust-dark">{clusterStats.verifiedBatches.toLocaleString()}</div>
            <div className="text-trust-dark text-xs mt-1">Verified batches</div>
          </div>
          <div className="bg-alert-tint rounded-2xl p-5">
            <div className="font-display text-2xl text-alert">{clusterStats.flaggedRecords}</div>
            <div className="text-alert text-xs mt-1">Flagged records</div>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-5">
            <div className="font-display text-2xl">{clusterStats.honeyProducedKgThisMonth.toLocaleString()}</div>
            <div className="text-muted text-xs mt-1">Kg produced, this month</div>
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5 text-sm font-medium">Registered beekeepers</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs border-b border-black/5">
                <th className="px-6 py-3 font-medium">Beekeeper</th>
                <th className="px-6 py-3 font-medium">Cluster</th>
                <th className="px-6 py-3 font-medium">Hives</th>
                <th className="px-6 py-3 font-medium">Verified batches</th>
                <th className="px-6 py-3 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody>
              {clusterBeekeepers.map((b) => (
                <tr key={b.name} className="border-b border-black/5 last:border-0">
                  <td className="px-6 py-3.5 font-medium">{b.name}</td>
                  <td className="px-6 py-3.5 text-muted">{b.cluster}</td>
                  <td className="px-6 py-3.5">{b.hives}</td>
                  <td className="px-6 py-3.5">{b.verifiedBatches}</td>
                  <td className="px-6 py-3.5">
                    {b.flagged > 0 ? (
                      <span className="inline-flex items-center gap-1 text-alert">
                        <Flag size={12} /> {b.flagged}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
