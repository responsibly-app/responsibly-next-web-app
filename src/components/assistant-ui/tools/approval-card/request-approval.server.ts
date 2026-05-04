import { tool, zodSchema } from "ai";
import { z } from "zod";

export const requestApprovalTool = tool({
  description:
    "Show an approval card requiring the user to approve or deny before proceeding. Use for consequential, irreversible, or sensitive actions.",
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
});
