"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBatch, getHives } from "@/lib/api";
import type { Hive } from "@/lib/types";
import { Check } from "lucide-react";

const steps = ["Select hive", "Batch details", "Confirm"];

export default function NewBatchPage() {
  const [hives, setHives] = useState<Hive[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const [hiveId, setHiveId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);

  useEffect(() => {
    getHives()
      .then((data) => {
        setHives(data);
        setHiveId(data[0]?.id ?? null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load hives"));
  }, []);

  async function handleCreate() {
    if (!hiveId || !quantity) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const batch = await createBatch({
        hiveId,
        extractionDate: date || new Date().toISOString().slice(0, 10),
        quantityKg: parseFloat(quantity),
      });
      setCreatedBatchId(batch.id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create batch");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-10 py-10">
      <h1 className="font-display text-3xl mb-8">Create honey batch</h1>

      {loadError && (
        <div className="bg-alert-tint border border-alert/20 rounded-2xl p-4 mb-8 text-sm text-alert">{loadError}</div>
      )}

      {!createdBatchId && !loadError && (
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  i < step ? "bg-trust text-white" : i === step ? "bg-primary text-white" : "bg-black/5 text-muted"
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-sm ${i === step ? "text-ink font-medium" : "text-muted"}`}>{s}</span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-black/10" />}
            </div>
          ))}
        </div>
      )}

      {createdBatchId ? (
        <div className="bg-white border border-black/5 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-trust-tint flex items-center justify-center mx-auto mb-4">
            <Check size={22} className="text-trust" />
          </div>
          <div className="font-display text-2xl mb-2">Batch created</div>
          <div className="text-muted text-sm mb-6">
            <span className="font-mono">{createdBatchId}</span> is linked to {hiveId} and recorded on-chain.
          </div>
          <Link
            href={`/beekeeper/batch/${createdBatchId}`}
            className="inline-block bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
          >
            View batch journey
          </Link>
        </div>
      ) : !loadError ? (
        <div className="bg-white border border-black/5 rounded-2xl p-7">
          {step === 0 && (
            <div>
              <div className="text-sm font-medium mb-4">Which hive did this honey come from?</div>
              {!hives ? (
                <div className="text-sm text-muted">Loading hives…</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {hives.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setHiveId(h.id)}
                      className={`text-left rounded-xl border p-4 transition-colors ${
                        hiveId === h.id ? "border-primary bg-primary-tint" : "border-black/10 hover:border-primary/40"
                      }`}
                    >
                      <div className="font-medium">{h.name}</div>
                      <div className="text-xs text-muted mt-1">{h.cluster}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium block mb-2">Extraction date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Quantity (kg)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 8.2"
                  className="w-full border border-black/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-sm font-medium mb-4">Confirm batch details</div>
              <div className="bg-primary-tint rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Hive</span>
                  <span className="font-medium">{hiveId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Extraction date</span>
                  <span className="font-medium">{date || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Quantity</span>
                  <span className="font-medium">{quantity ? `${quantity} kg` : "Not set"}</span>
                </div>
              </div>
              {submitError && <div className="text-sm text-alert mt-4">{submitError}</div>}
            </div>
          )}

          <div className="flex justify-between mt-7">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              className="text-sm text-muted disabled:opacity-0 px-4 py-2"
            >
              Back
            </button>
            <button
              onClick={() => (step === steps.length - 1 ? handleCreate() : setStep((s) => s + 1))}
              disabled={submitting || (step === 0 && !hiveId) || (step === 1 && !quantity)}
              className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {step === steps.length - 1 ? (submitting ? "Recording on-chain…" : "Create batch") : "Continue"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
