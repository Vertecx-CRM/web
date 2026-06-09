import { Suspense } from "react";
import LoginPage from "@/features/auth/login/login";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
