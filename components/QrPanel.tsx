"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";

export default function QrPanel({ batchId }: { batchId: string }) {
  const verifyUrl = typeof window !== "undefined" ? `${window.location.origin}/verify/${batchId}` : `/verify/${batchId}`;

  return (
    <div className="bg-white border border-black/5 rounded-2xl p-6">
      <div className="text-xs text-muted uppercase tracking-wide mb-4">QR code &middot; tamper-evident seal</div>
      <div className="flex justify-center bg-gold-tint rounded-xl p-5 border-2 border-dashed border-gold-dark/40">
        <QRCodeSVG value={verifyUrl} size={140} fgColor="#231A10" bgColor="transparent" />
      </div>
      <div className="text-xs text-muted text-center mt-3">Printed on a one-time-use security seal</div>
      <button className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-medium text-primary border border-primary/30 rounded-lg py-2.5 hover:bg-primary-tint transition-colors">
        <Download size={15} />
        Download QR
      </button>
    </div>
  );
}
