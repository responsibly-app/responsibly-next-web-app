import { tool, zodSchema } from "ai";
import { z } from "zod";

const meta = {
  name: "request_approval",
  description:
    "Show an approval card requiring the user to approve or deny before proceeding. Use for consequential, irreversible, or sensitive actions.",
  embeddingDescription:
    "Present a confirmation or approval dialog before taking a consequential action. Use when the user is about to do something irreversible, destructive, or sensitive — such as deleting data, submitting a form, or making a financial transaction — and needs to explicitly confirm or cancel.",
} as const;

export const requestApproval = {
  meta,
  tool: tool({
    description: meta.description,
    inputSchema: zodSchema(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        icon: z.string().optional(),
        metadata: z
          .array(z.object({ key: z.string().min(1), value: z.string() }))
          .optional(),
        variant: z.enum(["default", "destructive"]).optional(),
        confirmLabel: z.string().optional(),
        cancelLabel: z.string().optional(),
      }),
    ),
    // No execute — the human provides the result via the approval card UI.
  }),
};
