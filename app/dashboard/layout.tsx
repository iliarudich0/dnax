import { Navbar } from "@/components/layout/navbar";
import { AuthGuard } from "@/components/dashboard/auth-guard";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <Sidebar />
            <div className="glass-panel rounded-3xl bg-white/80 p-6 shadow-soft dark:bg-white/5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
