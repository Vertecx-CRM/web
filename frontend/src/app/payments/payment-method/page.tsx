import { Suspense } from "react";
import RegisterPaymentMarket from "@/features/landing/components/RegisterPaymentMarket";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegisterPaymentMarket />
    </Suspense>
  );
}
