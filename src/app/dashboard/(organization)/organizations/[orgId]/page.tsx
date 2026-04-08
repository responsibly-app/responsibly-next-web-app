import { use } from "react";
import { OrgDetailWithSettings } from "@/components/organizations/organization/org-detail-with-settings";

interface PageProps {
  params: Promise<{ orgId: string }>;
}

export default function OrgDetailPage({ params }: PageProps) {
  const { orgId } = use(params);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-2 pt-5">
      <OrgDetailWithSettings orgId={orgId} />
    </div>
  );
}
