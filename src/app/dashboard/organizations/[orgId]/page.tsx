import { OrgDetailView } from "@/components/organizations/org-detail-view";

export default async function OrgDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return <OrgDetailView orgId={orgId} />;
}
