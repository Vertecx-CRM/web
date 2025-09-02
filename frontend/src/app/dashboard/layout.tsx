"use client";

import AsideNav from "@/features/dashboard/layout/AsideNav";
import TopNav from "@/features/dashboard/layout/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Aside navigation */}
      <AsideNav />

      <div className="flex flex-col flex-1">
        {/* Top navigation */}
        <TopNav />

        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
