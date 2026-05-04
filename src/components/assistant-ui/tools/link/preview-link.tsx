"use client";

import { LinkPreview } from "@/components/tool-ui/link-preview";
import { safeParseSerializableLinkPreview } from "@/components/tool-ui/link-preview/schema";
import { type Toolkit } from "@assistant-ui/react";

export const previewLinkTool: Toolkit["previewLink"] = {
  type: "backend",
  render: ({ result }) => {
    const parsed = safeParseSerializableLinkPreview(result);
    if (!parsed) return null;
    return <LinkPreview {...parsed} />;
  },
};
