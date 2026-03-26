/**
 * Password Reset OTP Template
 *
 * Sent when users request to reset their password via OTP code.
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { sendEmail } from "../send-email";
import { appName } from "@/config";

interface PasswordResetOTPTemplateProps {
  otp: string;
  expiresIn: string;
  companyName: string;
}

export function PasswordResetOTPTemplate({
  otp,
  expiresIn,
  companyName,
}: PasswordResetOTPTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your password reset code: {otp}</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl px-4 py-12">
            <Text className="text-2xl font-bold text-black">{companyName}</Text>

            <Heading className="mt-8 text-2xl font-bold text-gray-900">
              Reset your password
            </Heading>

            <Text className="text-base leading-6 text-gray-700">
              We received a request to reset your password. Use the code below
              to proceed.
            </Text>

            <Section className="mt-4 rounded-md border border-solid border-gray-200 bg-gray-50 p-6 text-center">
              <Text className="m-0 font-mono text-4xl font-bold tracking-widest text-black">
                {otp}
              </Text>
            </Section>

            <Text className="mt-4 text-sm text-gray-500">
              This code will expire in {expiresIn}.
            </Text>

            <Hr className="my-8 border-gray-200" />

            <Text className="text-sm text-gray-500">
              If you didn&apos;t request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>

            <div className="mt-6 rounded-md border border-solid border-yellow-200 bg-yellow-50 p-4">
              <Text className="m-0 text-sm text-yellow-800">
                <strong>Security tip:</strong> Never share this code with
                anyone. {companyName} will never ask for your password via email.
              </Text>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

PasswordResetOTPTemplate.PreviewProps = {
  otp: "123456",
  expiresIn: "10 minutes",
  companyName: ""
} satisfies PasswordResetOTPTemplateProps;

export default PasswordResetOTPTemplate;

export async function sendPasswordResetOTP({
  userEmail,
  otp,
  expiresIn = "10 minutes",
  companyName = appName,
}: {
  userEmail: string;
  otp: string;
  expiresIn?: string;
  companyName?: string;
}) {
  await sendEmail({
    to: userEmail,
    subject: "Your password reset code",
    html: (await render(PasswordResetOTPTemplate({ otp, expiresIn, companyName }))) as string,
  });
}
