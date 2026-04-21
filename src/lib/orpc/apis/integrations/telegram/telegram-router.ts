import { ORPCError } from "@orpc/server";
import { and, eq, gt, lt } from "drizzle-orm";
import { z } from "zod/v3";
import { db } from "@/lib/db";
import { userTelegram, telegramVerification } from "@/lib/db/schema/telegram-schema";
import { user } from "@/lib/db/schema/better-auth-schema";
import { pub, authed, adminAuthed } from "@/lib/orpc/base";
import { createTelegramClient } from "@/lib/sdks/telegram-bot-client";
import ENVConfig from "@/config";
import {
  TelegramStatusOutputSchema,
  TelegramInitiateOutputSchema,
  TelegramUpdateSchema,
} from "./telegram-schemas";
import { debugLog } from "@/debug";
import { withVercelBypass } from "@/lib/utils/vercel";

export const telegramRouter = {
  status: authed
    .route({
      method: "GET",
      path: "/telegram/status",
      summary: "Check Telegram connection status",
      tags: ["Telegram"],
    })
    .output(TelegramStatusOutputSchema)
    .handler(async ({ context }) => {
      const [row] = await db
        .select()
        .from(userTelegram)
        .where(eq(userTelegram.userId, context.session.user.id))
        .limit(1);

      if (!row) return { connected: false };

      const telegram = createTelegramClient();
      const telegramPhotoUrl = await telegram.getProfilePhotoUrl(parseInt(row.telegramId));

      return {
        connected: true,
        telegramUsername: row.telegramUsername,
        telegramFirstName: row.telegramFirstName,
        telegramPhotoUrl,
      };
    }),

  initiate: authed
    .route({
      method: "POST",
      path: "/telegram/initiate",
      summary: "Generate a Telegram bot deep link to start the link flow",
      tags: ["Telegram"],
    })
    .output(TelegramInitiateOutputSchema)
    .handler(async ({ context }) => {
      const botUsername = process.env.TELEGRAM_BOT_USERNAME;
      if (!botUsername) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Telegram bot not configured",
        });
      }

      await db
        .delete(telegramVerification)
        .where(lt(telegramVerification.expiresAt, new Date()));

      const token = crypto.randomUUID().replace(/-/g, "");
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await db.insert(telegramVerification).values({
        token,
        userId: context.session.user.id,
        expiresAt,
      });

      return { url: `https://t.me/${botUsername}?start=${token}` };
    }),

  unlink: authed
    .route({
      method: "DELETE",
      path: "/telegram/unlink",
      summary: "Unlink Telegram account",
      tags: ["Telegram"],
    })
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context }) => {
      await db
        .delete(userTelegram)
        .where(eq(userTelegram.userId, context.session.user.id));

      return { success: true };
    }),

  setWebhook: adminAuthed
    .route({
      method: "POST",
      path: "/telegram/set-webhook",
      summary: "Register the Telegram bot webhook (admin only)",
      tags: ["Telegram"],
    })
    .input(z.object({ baseUrl: z.preprocess((v) => (!v ? undefined : v), z.string().url().optional()) }))
    .output(z.object({ ok: z.boolean(), description: z.string().optional(), webhookUrl: z.string() }))
    .handler(async ({ input }) => {
      const telegram = createTelegramClient();
      const base = input.baseUrl ?? ENVConfig.backend_base_url;
      const webhookUrl = withVercelBypass(`${base}/api/v1/rest/telegram/webhook`);
      const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

      const result = await telegram.setWebhook(webhookUrl, secret);
      return { ok: result.ok, description: result.description, webhookUrl };
    }),

  webhook: pub
    .route({
      method: "POST",
      path: "/telegram/webhook",
      summary: "Receive Telegram bot updates",
      tags: ["Telegram"],
    })
    .input(TelegramUpdateSchema)
    .output(z.object({ ok: z.boolean() }))
    .handler(async ({ input, context }) => {
      const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
      if (secret) {
        const header = context.headers.get("x-telegram-bot-api-secret-token");
        if (header !== secret) throw new ORPCError("UNAUTHORIZED");
      }

      debugLog("telegramWebhookRequests",
        "Received Telegram webhook event:", JSON.stringify(input, null, 2));

      const telegram = createTelegramClient();
      const from = input.message?.from;
      const text = input.message?.text ?? "";

      if (from && text.startsWith("/start ")) {
        const token = text.slice(7).trim();

        if (token) {
          const [verification] = await db
            .select()
            .from(telegramVerification)
            .where(and(
              eq(telegramVerification.token, token),
              gt(telegramVerification.expiresAt, new Date()),
            ))
            .limit(1);

          if (verification) {
            // Remove any existing link for this Telegram account (could be on a different userId)
            // so the current token owner can always re-link their Telegram account freely.
            await db
              .delete(userTelegram)
              .where(eq(userTelegram.telegramId, String(from.id)));

            await telegram.sendMessage(from.id, "Verifying your account…");

            const [userRow] = await db.select({ email: user.email }).from(user).where(eq(user.id, verification.userId)).limit(1);

            await db
              .insert(userTelegram)
              .values({
                id: crypto.randomUUID(),
                userId: verification.userId,
                telegramId: String(from.id),
                telegramUsername: from.username ?? null,
                telegramFirstName: from.first_name,
                telegramLastName: from.last_name ?? null,
              })
              .onConflictDoUpdate({
                target: userTelegram.userId,
                set: {
                  telegramId: String(from.id),
                  telegramUsername: from.username ?? null,
                  telegramFirstName: from.first_name,
                  telegramLastName: from.last_name ?? null,
                },
              });

            await db
              .delete(telegramVerification)
              .where(eq(telegramVerification.token, token));

            const accountLine = userRow?.email ? `\nAccount: ${userRow.email}` : "";
            await telegram.sendMessage(from.id, `✅ Your Telegram account has been connected successfully!${accountLine}`);
          }
        }
      }

      return { ok: true };
    }),
};
