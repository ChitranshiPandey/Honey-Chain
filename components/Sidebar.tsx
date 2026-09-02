"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Radio, Layers, QrCode, ArrowLeft } from "lucide-react";
import { beekeeperProfile } from "@/lib/mock-data";

const navItems = [
  { href: "/beekeeper", label: "Dashboard", icon: LayoutGrid },
  { href: "/beekeeper/hive/H101", label: "Live monitoring", icon: Radio },
  { href: "/beekeeper/batch/HC-MP-2026-00142", label: "Batches", icon: Layers },
  { href: "/beekeeper/batch/new", label: "New batch", icon: QrCode },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-ink text-white flex flex-col min-h-screen">
      <div className="px-6 pt-7 pb-6">
        <Link href="/" className="flex items-center gap-2 text-white/60 text-xs mb-6 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Back to Honey Chain
        </Link>
        <div className="font-display text-2xl">Honey Chain</div>
        <div className="text-gold text-xs mt-1">Beekeeper workspace</div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/beekeeper"
              ? pathname === "/beekeeper"
              : pathname.startsWith(item.href.split("/").slice(0, 3).join("/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-white/10 text-gold" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <div className="text-sm font-medium">{beekeeperProfile.name}</div>
        <div className="text-xs text-white/50 mt-0.5">{beekeeperProfile.cluster}</div>
      </div>
    </aside>
  );
}
