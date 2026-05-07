import { tool, jsonSchema } from "ai";

const meta = {
  name: "preview_link",
  description: "Show a preview card for a URL",
  embeddingDescription:
    "Render a rich link preview card for a given URL, showing the page title, description, and thumbnail image. Use when the user shares a link or asks to preview, open, or get a summary of a web page.",
} as const;

export const previewLink = {
  meta,
  tool: tool({
    description: meta.description,
    inputSchema: jsonSchema<{ url: string }>({
      type: "object",
      properties: { url: { type: "string", format: "uri" } },
      required: ["url"],
      additionalProperties: false,
    }),
    async execute({ url }) {
      return {
        id: "link-preview-1",
        href: url,
        title: "Example Site",
        description: "A description of the linked content",
        image: "https://example.com/image.jpg",
      };
    },
  }),
};
