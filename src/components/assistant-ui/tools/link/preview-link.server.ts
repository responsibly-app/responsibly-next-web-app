import { tool, jsonSchema } from "ai";

export const previewLinkTool = tool({
  description: "Show a preview card for a URL",
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
});
