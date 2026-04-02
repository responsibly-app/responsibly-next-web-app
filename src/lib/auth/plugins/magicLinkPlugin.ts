import { sendMagicLinkEmail } from "@/email/email-templates/magic-link";
import { magicLink } from "better-auth/plugins";

export const magicLinkPlugin = magicLink({
    sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ userEmail: email, magicLinkUrl: url });
    },
})