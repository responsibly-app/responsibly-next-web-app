/**
 * Delete Account Verification Email Template
 *
 * Sent when users request to delete their account.
 * User must click the link to confirm and finalize deletion.
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

interface DeleteAccountEmailTemplateProps {
  /** URL to confirm account deletion */
  deletionUrl: string;
  /** How long until the link expires */
  expiresIn?: string;
}

export function DeleteAccountEmailTemplate({
  deletionUrl,
  expiresIn = "1 hour",
}: DeleteAccountEmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Confirm your account deletion</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl px-4 py-12">
            <Text className="text-2xl font-bold text-black">Acme</Text>

            <Heading className="mt-8 text-2xl font-bold text-gray-900">
              Confirm account deletion
            </Heading>

            <Text className="text-base leading-6 text-gray-700">
              We received a request to permanently delete your account and all
              associated data. Click the button below to confirm this action.
            </Text>

            <Button
              href={deletionUrl}
              className="mt-4 box-border inline-block rounded-md bg-red-600 px-6 py-3 font-medium text-white"
            >
              Confirm Account Deletion
            </Button>

            <Text className="mt-4 text-sm text-gray-500">
              This link will expire in {expiresIn}.
            </Text>

            <Hr className="my-8 border-gray-200" />

            <Text className="text-sm text-gray-500">
              If you didn&apos;t request to delete your account, you can safely
              ignore this email. Your account will remain active.
            </Text>

            {/* Warning notice */}
            <div className="mt-6 rounded-md border border-solid border-red-200 bg-red-50 p-4">
              <Text className="m-0 text-sm text-red-800">
                <strong>Warning:</strong> This action is permanent and cannot be
                undone. All your data will be deleted immediately upon
                confirmation.
              </Text>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

DeleteAccountEmailTemplate.PreviewProps = {
  deletionUrl: "https://example.com/delete-account?token=abc123xyz",
  expiresIn: "1 hour",
} satisfies DeleteAccountEmailTemplateProps;

export default DeleteAccountEmailTemplate;


export async function sendDeleteAccountEmail(
  { userEmail, deletionUrl }: { userEmail: string; deletionUrl: string }
) {
  await sendEmail({
    to: userEmail,
    subject: "Confirm your account deletion",
    html: (await render(
      DeleteAccountEmailTemplate({ deletionUrl: deletionUrl })
    )) as string,
  });
}
