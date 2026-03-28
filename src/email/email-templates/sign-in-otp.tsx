/**
 * Sign In OTP Template
 *
 * Sent when users sign in or create a new account via OTP code.
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

interface SignInOTPTemplateProps {
  otp: string;
  expiresIn: string;
  companyName: string;
}

export function SignInOTPTemplate({
  otp,
  expiresIn,
  companyName,
}: SignInOTPTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your sign in code: {otp}</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl px-4 py-12">
            <Text className="text-2xl font-bold text-black">{companyName}</Text>

            <Heading className="mt-8 text-2xl font-bold text-gray-900">
              Sign in to your account
            </Heading>

            <Text className="text-base leading-6 text-gray-700">
              Use the code below to sign in. If you don&apos;t have an account
              yet, one will be created for you automatically.
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

SignInOTPTemplate.PreviewProps = {
  otp: "1234",
  expiresIn: "10 minutes",
  companyName: "",
} satisfies SignInOTPTemplateProps;

export default SignInOTPTemplate;

export async function sendSignInVerificationOTP({
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
    subject: "Your sign in code",
    html: (await render(SignInOTPTemplate({ otp, expiresIn, companyName }))) as string,
  });
}
