import { TelegramBotClient } from "./telegram-bot-client";

export type ChatMemberStatus = "creator" | "administrator" | "member" | "restricted" | "left" | "kicked";

interface ChatMember {
  status: ChatMemberStatus;
}

export class AdminTelegramBotClient extends TelegramBotClient {
  async getChatMember(chatId: string | number, userId: number): Promise<ChatMemberStatus | null> {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${this.token}/getChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, user_id: userId }),
        }
      );

      const data = await res.json() as { ok: boolean; result: ChatMember; description?: string };
      if (!data.ok) return null;
      return data.result.status;
    } catch {
      return null;
    }
  }
}

export function createAdminTelegramClient(): AdminTelegramBotClient {
  const token = process.env.ADMIN_TG_BOT_TOKEN;
  if (!token) throw new Error("ADMIN_TG_BOT_TOKEN is not set");
  return new AdminTelegramBotClient(token);
}
