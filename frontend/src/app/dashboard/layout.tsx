"use client";

import { useEffect, useState } from "react";
import AsideNav from "@/features/dashboard/layout/AsideNav";
import TopNav from "@/features/dashboard/layout/TopNav";
import { LoaderGate } from "@/shared/components/loader";
import RequireAuth from "@/features/auth/requireauth";
import { ChangePasswordModal } from "@/features/auth/Components/PasswordModals";
import { useAuth } from "@/features/auth/authcontext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated, ready, changePassword } = useAuth();
  const [forcePasswordModal, setForcePasswordModal] = useState(false);

  const mustChangePassword = !!user?.mustchangepassword;

  useEffect(() => {
    if (ready && isAuthenticated && mustChangePassword) {
      setForcePasswordModal(true);
    } else if (!mustChangePassword) {
      setForcePasswordModal(false);
    }
  }, [ready, isAuthenticated, mustChangePassword]);

  const handleForcePasswordSave = async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword?: string;
    newPassword: string;
  }) => {
    const current = currentPassword || "";
    const res = await changePassword(current, newPassword);
    if (!res.ok) {
      throw new Error(res.message || "No se pudo actualizar la contrasena");
    }
    setForcePasswordModal(false);
  };

  const handleForcePasswordClose = () => {
    if (mustChangePassword) {
      setForcePasswordModal(true);
      return;
    }
    setForcePasswordModal(false);
  };

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
      <ChangePasswordModal
        open={forcePasswordModal}
        onClose={handleForcePasswordClose}
        onSave={handleForcePasswordSave}
        requireCurrent
      />
    </RequireAuth>
  );
}
