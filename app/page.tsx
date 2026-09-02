import Link from "next/link";
import { Sprout, ScanLine, ShieldCheck } from "lucide-react";

const roles = [
  {
    href: "/beekeeper",
    icon: Sprout,
    title: "Beekeeper",
    desc: "Monitor hives, create honey batches, and track your production.",
  },
  {
    href: "/verify/HC-MP-2026-00142",
    icon: ScanLine,
    title: "Consumer",
    desc: "Scan a QR code to verify a honey batch's origin and journey.",
  },
  {
    href: "/admin",
    icon: ShieldCheck,
    title: "KVIC / Admin",
    desc: "Monitor beekeeper clusters, production, and flagged records.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-ink text-white relative overflow-hidden">
      <div className="absolute -top-10 -right-16 opacity-[0.06] pointer-events-none">
        <svg width="420" height="420" viewBox="0 0 420 420">
          <polygon points="105,0 210,60 210,180 105,240 0,180 0,60" fill="#F2A93B" />
          <polygon points="315,0 420,60 420,180 315,240 210,180 210,60" fill="#F2A93B" />
          <polygon points="105,180 210,240 210,360 105,420 0,360 0,240" fill="#F2A93B" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-8 pt-28 pb-20 relative">
        <h1 className="font-display text-6xl leading-[1.05] max-w-2xl">
          A digital identity for every honey batch.
        </h1>
        <p className="text-white/60 text-lg mt-6 max-w-lg">
          From hive to bottle — Honey Chain connects IoT hive monitoring, AI insights, and
          blockchain-verified traceability into one system for rural beekeepers.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-14">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.href}
                href={role.href}
                className="group bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] hover:border-gold/40 transition-all"
              >
                <Icon size={22} className="text-gold" />
                <div className="font-display text-xl mt-4">{role.title}</div>
                <div className="text-white/50 text-sm mt-2 leading-relaxed">{role.desc}</div>
                <div className="text-gold text-sm mt-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
