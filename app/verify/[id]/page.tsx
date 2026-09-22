import { notFound } from "next/navigation";
import { verifyBatch } from "@/lib/api";
import { CheckCircle2, MapPin, Calendar, Droplet } from "lucide-react";

// Always backed by a live API call — never statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const result = await verifyBatch(params.id);
  if (!result.found || !result.batch) return notFound();
  const batch = result.batch;

  return (
    <div className="min-h-screen bg-paper flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="font-display text-xl">Honey Chain</div>
        </div>

        <div className="bg-white border border-black/5 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-trust-tint flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-trust" />
          </div>
          <div className="font-display text-2xl">Verified honey</div>
          <div className="text-muted text-sm mt-1">This batch is authentic and traceable</div>

          <div className="bg-trust-tint rounded-2xl py-4 mt-6">
            <div className="text-trust-dark text-3xl font-display">{batch.authenticityScore}<span className="text-lg">/100</span></div>
            <div className="text-trust-dark text-xs mt-1">Authenticity score</div>
          </div>

          <div className="text-left mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium">{batch.beekeeper}</div>
                <div className="text-xs text-muted">{batch.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium">Extracted {batch.extractionDate}</div>
                <div className="text-xs text-muted">Batch {batch.id}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Droplet size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium">{batch.quantityKg} kg, this batch</div>
                <div className="text-xs text-muted">Pure forest honey</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-3xl p-6 mt-4">
          <div className="text-sm font-medium mb-4">Batch journey</div>
          <div className="space-y-3">
            {batch.events.map((event) => (
              <div key={event.label} className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${event.verified ? "bg-trust" : "bg-black/15"}`} />
                <div className="text-sm text-ink/80 flex-1">{event.label}</div>
                <div className="text-xs text-muted shrink-0">{event.date.split(",")[0]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-muted mt-6 leading-relaxed px-4">
          {result.chainConfirmed
            ? "This record's blockchain seal is intact — it matches the batch as originally recorded."
            : "This batch has no blockchain record yet."}{" "}
          Purity is confirmed through quality checks recorded in the batch journey above.
        </div>
      </div>
    </div>
  );
}
