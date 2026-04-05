"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import {
  useGetInvitation,
  useAcceptInvitation,
  useRejectInvitation,
} from "@/lib/auth/hooks";
import { routes } from "@/routes";
import { ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";

type Props = { invitationId: string };

export function AcceptInvitationView({ invitationId }: Props) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: invitation, isPending: invitePending, error } = useGetInvitation(invitationId);
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();

  function handleSignIn() {
    const redirectTo = encodeURIComponent(routes.dashboard.acceptInvitation(invitationId));
    router.push(`${routes.auth.signIn()}?redirectTo=${redirectTo}`);
  }

  function handleAccept() {
    acceptInvitation.mutate(invitationId, {
      onSuccess: () => {
        toast.success("You've joined the organization.");
        router.push(routes.dashboard.organizations());
      },
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to accept invitation.");
      },
    });
  }

  function handleDecline() {
    rejectInvitation.mutate(invitationId, {
      onSuccess: () => {
        toast.info("Invitation declined.");
        router.push(routes.dashboard.root());
      },
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to decline invitation.");
      },
    });
  }

  if (sessionPending || (!!invitationId && invitePending)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <InviteCard
        icon={<Mail className="text-muted-foreground size-8" />}
        title="Invitation not found"
        description="This invitation link is invalid or has already expired."
      >
        <Button className="w-full" onClick={() => router.push(routes.dashboard.root())}>
          Go to Dashboard
        </Button>
      </InviteCard>
    );
  }

  if (invitation.status !== "pending") {
    const messages: Record<string, string> = {
      accepted: "This invitation has already been accepted.",
      rejected: "This invitation has already been declined.",
      canceled: "This invitation was cancelled by the organization.",
    };
    return (
      <InviteCard
        icon={<Mail className="text-muted-foreground size-8" />}
        title="Invitation unavailable"
        description={messages[invitation.status] ?? "This invitation is no longer valid."}
      >
        <Button className="w-full" onClick={() => router.push(routes.dashboard.root())}>
          Go to Dashboard
        </Button>
      </InviteCard>
    );
  }

  if (!session) {
    return (
      <InviteCard
        icon={<Building2 className="text-muted-foreground size-8" />}
        title="You've been invited"
        description="Sign in to your account to accept this organization invitation."
      >
        <Button className="w-full" onClick={handleSignIn}>
          Sign in to accept
        </Button>
      </InviteCard>
    );
  }

  const inv = invitation as typeof invitation & {
    organizationName?: string;
    organization?: { name?: string };
    inviterEmail?: string;
    inviter?: { email?: string; name?: string };
  };

  const orgName = inv.organizationName ?? inv.organization?.name ?? "an organization";
  const inviterEmail = inv.inviterEmail ?? inv.inviter?.email;

  return (
    <InviteCard
      icon={
        <div className="bg-muted flex size-12 items-center justify-center rounded-full">
          <Building2 className="size-6" />
        </div>
      }
      title={`Join ${orgName}`}
      description={
        inviterEmail
          ? `${inviterEmail} has invited you to join ${orgName}.`
          : `You've been invited to join ${orgName}.`
      }
    >
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center justify-between rounded-md border px-4 py-3 text-sm">
          <span className="text-muted-foreground">You&apos;ll join as</span>
          <Badge variant="secondary">
            {ROLE_META[invitation.role].label ?? invitation.role}
          </Badge>
        </div>
        <Button
          className="w-full"
          onClick={handleAccept}
          disabled={acceptInvitation.isPending || rejectInvitation.isPending}
        >
          {acceptInvitation.isPending && (
            <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
          )}
          Accept Invitation
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDecline}
          disabled={acceptInvitation.isPending || rejectInvitation.isPending}
        >
          {rejectInvitation.isPending && (
            <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
          )}
          Decline
        </Button>
      </div>
    </InviteCard>
  );
}

function InviteCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">{children}</CardFooter>
      </Card>
    </div>
  );
}
