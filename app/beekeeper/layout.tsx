import Sidebar from "@/components/Sidebar";

export default function BeekeeperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-paper min-h-screen">{children}</main>
    </div>
  );
}
