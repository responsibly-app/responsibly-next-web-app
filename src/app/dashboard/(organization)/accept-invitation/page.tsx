import { AcceptInvitationView } from "@/components/organizations/invitations/accept-invitation-view";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  return <AcceptInvitationView invitationId={id ?? ""} />;
}
