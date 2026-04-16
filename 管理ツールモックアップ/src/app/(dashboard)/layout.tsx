import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AppProviders } from "@/components/layout/app-providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Header />
          <main className="flex-1 min-w-0 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </AppProviders>
  );
}
