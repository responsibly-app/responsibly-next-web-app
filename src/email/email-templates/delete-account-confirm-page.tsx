/**
 * Delete Account Confirmation Page Email Template
 *
 * Sent when users request to delete their account.
 * Links to the in-app confirmation page where the user must acknowledge
 * before the deletion is finalized.
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

interface DeleteAccountConfirmPageEmailTemplateProps {
  /** URL to the in-app confirmation page (includes token as query param) */
  confirmationPageUrl: string;
  /** How long until the token expires */
  expiresIn: string;
  companyName: string;
}

export function DeleteAccountConfirmPageEmailTemplate({
  confirmationPageUrl,
  expiresIn,
  companyName,
}: DeleteAccountConfirmPageEmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Confirm your account deletion</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl px-4 py-12">
            <Text className="text-2xl font-bold text-black">{companyName}</Text>

            <Heading className="mt-8 text-2xl font-bold text-gray-900">
              Confirm account deletion
            </Heading>

            <Text className="text-base leading-6 text-gray-700">
              We received a request to permanently delete your account and all
              associated data. Click the button below to review and confirm this
              action.
            </Text>

            <Button
              href={confirmationPageUrl}
              className="mt-4 box-border inline-block rounded-md bg-red-600 px-6 py-3 font-medium text-white"
            >
              Review Deletion Request
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

DeleteAccountConfirmPageEmailTemplate.PreviewProps = {
  confirmationPageUrl: "https://example.com/auth/delete-account?token=abc123xyz",
  expiresIn: "1 hour",
  companyName: "",
} satisfies DeleteAccountConfirmPageEmailTemplateProps;

export default DeleteAccountConfirmPageEmailTemplate;


export async function sendDeleteAccountConfirmPageEmail({
  userEmail,
  confirmationPageUrl,
  expiresIn = "1 hour",
  companyName = appName,
}: {
  userEmail: string;
  confirmationPageUrl: string;
  expiresIn?: string;
  companyName?: string;
}) {
  await sendEmail({
    to: userEmail,
    subject: "Confirm your account deletion",
    html: (await render(
      DeleteAccountConfirmPageEmailTemplate({ confirmationPageUrl, expiresIn, companyName })
    )) as string,
  });
}
