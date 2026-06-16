import type { ReactNode } from "react";
import type { Metadata } from "next";
import NotificationsRoot from "@/shared/components/NotificationsRoot";

export const metadata: Metadata = {
  title: "Acceso",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <NotificationsRoot />
    </>
  );
}
