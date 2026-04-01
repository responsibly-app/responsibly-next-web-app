/**
 * Organization Invitation Email Template
 *
 * Sent when a user is invited to join an organization.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  render,
  Tailwind,
  Text,
} from "@react-email/components";
import { sendEmail } from "../../send-email";
import { appName } from "@/config";

interface OrganizationInvitationEmailTemplateProps {
  invitedByUsername: string;
  invitedByEmail: string;
  organizationName: string;
  inviteLink: string;
  companyName: string;
}

export function OrganizationInvitationEmailTemplate({
  invitedByUsername,
  invitedByEmail,
  organizationName,
  inviteLink,
  companyName,
}: OrganizationInvitationEmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {invitedByUsername} invited you to join {organizationName} on{" "}
        {companyName}
      </Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl px-4 py-12">
            <Text className="text-2xl font-bold text-black">{companyName}</Text>

            <Heading className="mt-8 text-2xl font-bold text-gray-900">
              You&apos;ve been invited to join {organizationName}
            </Heading>

            <Text className="text-base leading-6 text-gray-700">
              <strong>{invitedByUsername}</strong> ({invitedByEmail}) has
              invited you to join the <strong>{organizationName}</strong>{" "}
              organization on {companyName}.
            </Text>

            <Button
              href={inviteLink}
              className="mt-4 box-border inline-block rounded-md bg-black px-6 py-3 font-medium text-white"
            >
              Accept Invitation
            </Button>

            <Hr className="my-8 border-gray-200" />

            <Text className="text-sm text-gray-500">
              If you weren&apos;t expecting this invitation, you can safely
              ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

OrganizationInvitationEmailTemplate.PreviewProps = {
  invitedByUsername: "Jane Doe",
  invitedByEmail: "jane@example.com",
  organizationName: "Acme Corp",
  inviteLink: "https://example.com/accept-invitation/abc123",
  companyName: appName,
} satisfies OrganizationInvitationEmailTemplateProps;

export default OrganizationInvitationEmailTemplate;

export async function sendOrganizationInvitation({
  email,
  invitedByUsername,
  invitedByEmail,
  organizationName,
  inviteLink,
  companyName = appName,
}: {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  organizationName: string;
  inviteLink: string;
  companyName?: string;
}) {
  await sendEmail({
    to: email,
    subject: `You've been invited to join ${organizationName} on ${companyName}`,
    html: (await render(
      OrganizationInvitationEmailTemplate({
        invitedByUsername,
        invitedByEmail,
        organizationName,
        inviteLink,
        companyName,
      }),
    )) as string,
  });
}
