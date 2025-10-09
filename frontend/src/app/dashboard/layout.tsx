"use client";

import { useState } from "react";
import AsideNav from "@/features/dashboard/layout/AsideNav";
import TopNav from "@/features/dashboard/layout/TopNav";
import { LoaderGate } from "@/shared/components/loader";
import RequireAuth from "@/features/auth/requireauth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <RequireAuth>
      <LoaderGate />
      <div className="flex h-screen">
        <AsideNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div
          className="flex flex-col transition-all duration-300"
          style={{
            width: isCollapsed ? "100%" : "calc(100% - 16rem)",
            marginLeft: isCollapsed ? 0 : "16rem",
          }}
        >
          <TopNav />
          <main className="flex-1 h-50 bg-gray-100 p-6 overflow-x-hidden overflow-y-hidden scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
