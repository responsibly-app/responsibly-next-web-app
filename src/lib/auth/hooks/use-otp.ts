"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

type OtpType = "sign-in" | "email-verification" | "forget-password";

type SendVerificationOtpParams = {
  email: string;
  type: OtpType;
};

type CheckVerificationOtpParams = {
  email: string;
  type: OtpType;
  otp: string;
};

type VerifyEmailOtpParams = {
  email: string;
  otp: string;
};

type SignInEmailOtpParams = {
  email: string;
  otp: string;
};

/** Send email OTP hook */
export function useSendVerificationOtp() {
  return useMutation({
    mutationFn: async ({ email, type }: SendVerificationOtpParams) => {
      const result = await authClient.emailOtp.sendVerificationOtp({ email, type });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Check email OTP hook */
export function useCheckVerificationOtp() {
  return useMutation({
    mutationFn: async ({ email, type, otp }: CheckVerificationOtpParams) => {
      const result = await authClient.emailOtp.checkVerificationOtp({ email, type, otp });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Verify email with OTP hook */
export function useVerifyEmailOtp() {
  return useMutation({
    mutationFn: async ({ email, otp }: VerifyEmailOtpParams) => {
      const result = await authClient.emailOtp.verifyEmail({ email, otp });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Sign in with email OTP hook */
export function useSignInEmailOtp() {
  return useMutation({
    mutationFn: async ({ email, otp }: SignInEmailOtpParams) => {
      const result = await authClient.signIn.emailOtp({ email, otp });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Reset password with OTP hook (forgot password flow) */
export function useResetPasswordWithOtp() {
  return useMutation({
    mutationFn: async ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) => {
      const result = await authClient.emailOtp.resetPassword({ email: email, otp: otp, password: newPassword });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}
