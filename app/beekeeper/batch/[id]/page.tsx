import { notFound } from "next/navigation";
import { getBatch } from "@/lib/api";
import { CheckCircle2, Circle } from "lucide-react";
import QrPanel from "@/components/QrPanel";

export default async function BatchDetailPage({ params }: { params: { id: string } }) {
  const batch = await getBatch(params.id);
  if (!batch) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-3xl">{batch.id}</h1>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-trust-tint text-trust-dark">
          {batch.status}
        </span>
      </div>
      <div className="text-muted text-sm mb-8">
        {batch.hiveName} &middot; {batch.quantityKg} kg &middot; extracted {batch.extractionDate}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* journey timeline */}
        <div className="col-span-2 bg-white border border-black/5 rounded-2xl p-6">
          <div className="text-sm font-medium mb-5">Batch journey</div>
          <div className="space-y-0">
            {batch.events.map((event, i) => (
              <div key={event.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {event.verified ? (
                    <CheckCircle2 size={18} className="text-trust shrink-0" />
                  ) : (
                    <Circle size={18} className="text-muted shrink-0" />
                  )}
                  {i < batch.events.length - 1 && <div className="w-px flex-1 bg-black/10 my-1" />}
                </div>
                <div className="pb-6">
                  <div className={`text-sm font-medium ${event.verified ? "text-ink" : "text-muted"}`}>
                    {event.label}
                  </div>
                  <div className="text-xs text-muted mt-0.5">{event.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* blockchain + qr */}
        <div className="space-y-6">
          <div className="bg-ink text-white rounded-2xl p-6">
            <div className="text-xs text-white/50 uppercase tracking-wide mb-4">Blockchain info</div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-white/40 text-xs">Transaction hash</div>
                <div className="font-mono text-gold">{batch.txHash ?? "Pending"}</div>
              </div>
              <div>
                <div className="text-white/40 text-xs">Block number</div>
                <div>{batch.blockNumber?.toLocaleString() ?? "Pending"}</div>
              </div>
              <div>
                <div className="text-white/40 text-xs">Network</div>
                <div>{batch.network ?? "—"}</div>
              </div>
            </div>
          </div>

          <QrPanel batchId={batch.id} />
        </div>
      </div>
    </div>
  );
}
