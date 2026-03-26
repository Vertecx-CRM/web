import { Suspense } from "react";
import WompiPaymentMethod from "@/features/landing/components/WompiPaymentMethod";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WompiPaymentMethod />
    </Suspense>
  );
}
