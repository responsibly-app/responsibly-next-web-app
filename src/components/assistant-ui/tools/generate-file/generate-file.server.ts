import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { Session } from "@/lib/orpc/context";
import { supabase } from "@/supabase/client";

const JsonPrimitive = z.union([z.string(), z.number(), z.boolean(), z.null()]);

const meta = {
  name: "generate_file",
  description:
    "Generate a downloadable file (CSV, JSON, TXT, or HTML) from data and save it for the user to download. After calling this tool, do NOT include a markdown link or URL to the file in your response — the download UI is shown automatically.",
  embeddingDescription:
    "Create and save a downloadable file from data. Use when the user asks to export data, generate a report, download as CSV, save results to a file, create a spreadsheet, export a list, save any structured data to a file format like CSV, JSON, or plain text, or generate an HTML page or report.",
} as const;

function buildCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");
}

export const generateFile = {
  meta,
  create(session: Session) {
    return tool({
      description: meta.description,
      inputSchema: zodSchema(
        z.object({
          filename: z
            .string()
            .describe("Filename with extension, e.g. report.csv or data.json"),
          format: z.enum(["csv", "json", "txt", "html"]),
          rows: z
            .array(
              z.record(
                z.string(),
                z.union([JsonPrimitive, z.array(JsonPrimitive)]),
              ),
            )
            .optional()
            .describe("For csv/json: array of data objects with consistent keys"),
          content: z
            .string()
            .optional()
            .describe("For txt or pre-serialized content: raw text"),
        }),
      ),
      execute: async ({ filename, format, rows, content }) => {
        let fileContent: string;
        let mimeType: string;

        switch (format) {
          case "csv":
            fileContent = buildCsv((rows ?? []) as Record<string, unknown>[]);
            mimeType = "text/csv";
            break;
          case "json":
            fileContent = content ?? JSON.stringify(rows ?? [], null, 2);
            mimeType = "application/json";
            break;
          case "html":
            fileContent = content ?? "";
            mimeType = "text/html";
            break;
          default:
            fileContent = content ?? "";
            mimeType = "text/plain";
        }

        const bytes = Buffer.from(fileContent, "utf-8");
        const ext = filename.includes(".") ? filename.split(".").pop() : format;
        const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

        const { error } = await supabase.storage
          .from("chat-attachments")
          .upload(path, bytes, { contentType: mimeType, upsert: false });

        if (error) {
          return { error: `Upload failed: ${error.message}` };
        }

        const { data: urlData } = supabase.storage
          .from("chat-attachments")
          .getPublicUrl(path);

        return {
          filename,
          mimeType,
          publicUrl: urlData.publicUrl,
          sizeBytes: bytes.length,
          _instructions: "File generated. Do not include a download link or URL in your response — the download button is shown automatically in the UI.",
        };
      },
    });
  },
};
