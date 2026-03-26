/**
 * Email Verification OTP Template
 *
 * Sent when users need to verify their email address via OTP code.
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

interface EmailVerificationOTPTemplateProps {
  otp: string;
  expiresIn: string;
  companyName: string;
}

export function EmailVerificationOTPTemplate({
  otp,
  expiresIn,
  companyName,
}: EmailVerificationOTPTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your email verification code: {otp}</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl px-4 py-12">
            <Text className="text-2xl font-bold text-black">{companyName}</Text>

            <Heading className="mt-8 text-2xl font-bold text-gray-900">
              Verify your email
            </Heading>

            <Text className="text-base leading-6 text-gray-700">
              Use the code below to verify your email address and complete your
              account setup.
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
              If you didn&apos;t request this code, you can safely ignore this
              email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

EmailVerificationOTPTemplate.PreviewProps = {
  otp: "123456",
  expiresIn: "10 minutes",
  companyName: ""
} satisfies EmailVerificationOTPTemplateProps;

export default EmailVerificationOTPTemplate;

export async function sendEmailVerificationOTP({
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
    subject: "Your email verification code",
    html: (await render(EmailVerificationOTPTemplate({ otp, expiresIn, companyName }))) as string,
  });
}
