"use client";
import { Suspense } from "react";
import RegisterPaymentMarket from "../../../features/landing/components/RegisterPaymentMarket";
export default function RegisterPaymentPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPaymentMarket />
    </Suspense>
  );
}
