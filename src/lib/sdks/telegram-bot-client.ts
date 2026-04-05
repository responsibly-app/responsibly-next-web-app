const TELEGRAM_API = "https://api.telegram.org";

interface SetWebhookResult {
  ok: boolean;
  description?: string;
}

export class TelegramBotClient {
  private readonly base: string;

  constructor(private readonly token: string) {
    this.base = `${TELEGRAM_API}/bot${token}`;
  }

  private async call<T>(method: string, body?: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.base}/${method}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json() as { ok: boolean; result: T; description?: string };

    if (!data.ok) {
      throw new Error(`Telegram API error [${method}]: ${data.description ?? "unknown"}`);
    }

    return data.result;
  }

  async setWebhook(webhookUrl: string, secretToken?: string): Promise<SetWebhookResult> {
    const body: Record<string, string> = { url: webhookUrl };
    if (secretToken) body.secret_token = secretToken;

    const res = await fetch(`${this.base}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return res.json() as Promise<SetWebhookResult>;
  }

  async sendMessage(chatId: number, text: string): Promise<void> {
    await this.call("sendMessage", { chat_id: chatId, text });
  }

  async getProfilePhotoUrl(userId: number): Promise<string | null> {
    try {
      const photos = await this.call<{ photos: { file_id: string }[][] }>(
        `getUserProfilePhotos?user_id=${userId}&limit=1`
      );

      const fileId = photos.photos?.[0]?.[0]?.file_id;
      if (!fileId) return null;

      const file = await this.call<{ file_path: string }>(`getFile?file_id=${fileId}`);
      if (!file.file_path) return null;

      return `${TELEGRAM_API}/file/bot${this.token}/${file.file_path}`;
    } catch {
      return null;
    }
  }
}

export function createTelegramClient(): TelegramBotClient {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return new TelegramBotClient(token);
}
