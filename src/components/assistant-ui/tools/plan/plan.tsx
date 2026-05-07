"use client";

import { type Toolkit } from "@assistant-ui/react";
import { Plan } from "@/components/tool-ui/plan";
import { safeParseSerializablePlan } from "@/components/tool-ui/plan/schema";

export const showPlanTool: Toolkit["show_plan"] = {
    type: "backend",
    render: ({ result }) => {
        const parsed = safeParseSerializablePlan(result);
        if (!parsed) return null;
        return <Plan {...parsed} />;
    },
};
