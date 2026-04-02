import { AuthContainer, AuthLayout } from "@/app/(auth)/_components/auth-layout";
import { Suspense } from "react";
import { ApproveView } from "./_components/approve-view";

export default function ApprovePage() {
  return (
    <AuthLayout>
      <AuthContainer>
        <Suspense>
          <ApproveView />
        </Suspense>
      </AuthContainer>
    </AuthLayout>
  );
}
