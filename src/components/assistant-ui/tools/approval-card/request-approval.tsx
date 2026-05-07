"use client";

import { type Toolkit } from "@assistant-ui/react";
import { ApprovalCard } from "@/components/tool-ui/approval-card";
import { safeParseSerializableApprovalCard } from "@/components/tool-ui/approval-card/schema";
import type { ApprovalDecision } from "@/components/tool-ui/approval-card/schema";

export const requestApprovalTool: Toolkit["request_approval"] = {
  type: "human",
  parameters: { type: "object" as const, additionalProperties: true },
  render: ({ args, result, addResult, toolCallId }) => {
    const parsed = safeParseSerializableApprovalCard({
      ...args,
      id: `approval-${toolCallId}`,
    });
    if (!parsed) return null;

    const choice = (result as { choice?: ApprovalDecision } | undefined)
      ?.choice;

    return (
      <ApprovalCard
        {...parsed}
        choice={choice}
        onConfirm={() => addResult({ choice: "approved" })}
        onCancel={() => addResult({ choice: "denied" })}
      />
    );
  },
};
