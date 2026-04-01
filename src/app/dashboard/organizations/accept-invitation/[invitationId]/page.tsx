import { AcceptInvitationView } from "./_components/accept-invitation-view";

interface PageProps {
  params: Promise<{ invitationId: string }>;
}

export default async function AcceptInvitationPage({ params }: PageProps) {
  const { invitationId } = await params;
  return <AcceptInvitationView invitationId={invitationId} />;
}
