/**
 * Magic Link Email Template
 *
 * Sent when users request a passwordless sign-in link.
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
import { sendEmail } from "../send-email";
import { appName } from "@/config";

interface MagicLinkEmailTemplateProps {
  /** The magic link URL to sign in */
  magicLinkUrl: string;
  /** How long until the link expires */
  expiresIn: string;
  companyName: string;
}

export function MagicLinkEmailTemplate({
  magicLinkUrl,
  expiresIn,
  companyName,
}: MagicLinkEmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your sign-in link for {companyName}</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl px-4 py-12">
            <Text className="text-2xl font-bold text-black">{companyName}</Text>

            <Heading className="mt-8 text-2xl font-bold text-gray-900">
              Sign in to {companyName}
            </Heading>

            <Text className="text-base leading-6 text-gray-700">
              Click the button below to sign in. No password needed — this link
              is single-use and will expire shortly.
            </Text>

            <Button
              href={magicLinkUrl}
              className="mt-4 box-border inline-block rounded-md bg-black px-6 py-3 font-medium text-white"
            >
              Sign in
            </Button>

            <Text className="mt-4 text-sm text-gray-500">
              This link will expire in {expiresIn}.
            </Text>

            <Hr className="my-8 border-gray-200" />

            <Text className="text-sm text-gray-500">
              If you didn&apos;t request this link, you can safely ignore this
              email. Your account will remain secure.
            </Text>

            <div className="mt-6 rounded-md border border-solid border-yellow-200 bg-yellow-50 p-4">
              <Text className="m-0 text-sm text-yellow-800">
                <strong>Security tip:</strong> Never share this link with
                anyone. {companyName} will never ask for it via email.
              </Text>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

MagicLinkEmailTemplate.PreviewProps = {
  magicLinkUrl: "https://example.com/auth/magic-link?token=abc123xyz",
  expiresIn: "10 minutes",
  companyName: "",
} satisfies MagicLinkEmailTemplateProps;

export default MagicLinkEmailTemplate;

export async function sendMagicLinkEmail({
  userEmail,
  magicLinkUrl,
  expiresIn = "10 minutes",
  companyName = appName,
}: {
  userEmail: string;
  magicLinkUrl: string;
  expiresIn?: string;
  companyName?: string;
}) {
  await sendEmail({
    to: userEmail,
    subject: `Your sign-in link for ${companyName}`,
    html: (await render(
      MagicLinkEmailTemplate({ magicLinkUrl, expiresIn, companyName }),
    )) as string,
  });
}
