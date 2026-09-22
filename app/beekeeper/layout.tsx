import Sidebar from "@/components/Sidebar";
import { getBeekeeperProfile } from "@/lib/api";

// Always backed by a live API call — never statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function BeekeeperLayout({ children }: { children: React.ReactNode }) {
  const profile = await getBeekeeperProfile();

  return (
    <div className="flex">
      <Sidebar name={profile.name} cluster={profile.cluster} />
      <main className="flex-1 bg-paper min-h-screen">{children}</main>
    </div>
  );
}
