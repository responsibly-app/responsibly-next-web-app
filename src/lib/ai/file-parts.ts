import type { UIMessage } from "ai";

// OpenAI and similar models don't support text/plain as a file media type.
// This converts those parts into inline text parts by fetching/decoding their content.
export async function inlineTextFileParts(messages: UIMessage[]): Promise<UIMessage[]> {
  return Promise.all(
    messages.map(async (msg) => {
      if (msg.role !== "user") return msg;

      const newParts = await Promise.all(
        msg.parts.map(async (part) => {
          const p = part as Record<string, unknown>;
          if (p.type !== "file" || p.mediaType !== "text/plain") return part;

          const url = p.url as string | undefined;
          if (!url) return part;

          try {
            let text: string;
            if (url.startsWith("data:")) {
              const base64 = url.split(",")[1];
              text = Buffer.from(base64, "base64").toString("utf-8");
            } else {
              const res = await fetch(url);
              text = await res.text();
            }
            const name = (p.name as string | undefined) ?? "file";
            return { type: "text", text: `[File: ${name}]\n${text}` } as UIMessage["parts"][number];
          } catch {
            return part;
          }
        }),
      );

      return { ...msg, parts: newParts as UIMessage["parts"] };
    }),
  );
}
