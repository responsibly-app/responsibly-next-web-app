import { sendEmailVerificationOTP } from "@/email/email-templates/email-verification-otp";
import { sendPasswordResetOTP } from "@/email/email-templates/password-reset-otp";
import { sendSignInVerificationOTP } from "@/email/email-templates/sign-in-otp";
import { emailOTP } from "better-auth/plugins";


export const emailOTPPlugin = emailOTP({
    otpLength: 4,
    expiresIn: 60 * 10, // 10 minutes
    async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
            await sendSignInVerificationOTP({ userEmail: email, otp: otp, expiresIn: "10 minutes" });
        } else if (type === "email-verification") {
            await sendEmailVerificationOTP({ userEmail: email, otp: otp, expiresIn: "10 minutes" });
        } else if (type === "forget-password") {
            await sendPasswordResetOTP({ userEmail: email, otp: otp, expiresIn: "10 minutes" });
        }
    },
})