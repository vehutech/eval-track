"use client";

import { useState } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { Sidebar } from "@/src/components/layout/sidebar";
import { Topbar } from "@/src/components/layout/topbar";
import { ToastProvider, Toaster } from "@/src/hooks/use-toast";
import type { Role } from "@/src/types/prisma";

export const dynamic = "force-dynamic";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = (session?.user?.role as Role) ?? "STUDENT";
  const userName = session?.user?.name ?? "";

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[hsl(var(--background))]">
        <Sidebar
          role={role}
          userName={userName}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </ToastProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardInner>{children}</DashboardInner>
    </SessionProvider>
  );
}
