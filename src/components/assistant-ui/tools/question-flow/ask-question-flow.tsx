"use client";

import { type Toolkit } from "@assistant-ui/react";
import { useState } from "react";
import { QuestionFlow } from "@/components/tool-ui/question-flow";
import { Skeleton } from "@/components/ui/skeleton";

type FlowOption = {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type FlowStep = {
  id: string;
  title: string;
  description?: string;
  options: FlowOption[];
  selectionMode?: "single" | "multi";
};

function buildReceipt(steps: FlowStep[], answers: Record<string, string[]>) {
  const summary = steps.map((step) => {
    const selectedIds = answers[step.id] ?? [];
    const value = step.options
      .filter((opt) => selectedIds.includes(opt.id))
      .map((opt) => opt.label)
      .join(", ");
    return { label: step.title, value: value || "—" };
  });
  const title = steps.length === 1 ? steps[0].title : "Your selections";
  return { title, summary };
}

function QuestionFlowSkeleton() {
  return (
    <div className="flex w-full min-w-80 max-w-md flex-col gap-3">
      <div className="bg-card flex w-full flex-col gap-4 rounded-2xl border p-5 shadow-xs">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex flex-col gap-0 px-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-4 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-full" style={{ width: `${55 + i * 15}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end pt-2">
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuestionFlowTool({ args, result, addResult, toolCallId }: any) {
  const id = `question-flow-${toolCallId}`;
  const steps = (args as { steps: FlowStep[] }).steps;
  const [localAnswers, setLocalAnswers] = useState<Record<
    string,
    string[]
  > | null>(null);

  if (
    !steps?.length ||
    steps.some((s: FlowStep) => !s.options?.length || s.options.some((o) => !o.id))
  )
    return <QuestionFlowSkeleton />;

  const completedAnswers =
    (result as Record<string, string[]> | undefined) ?? localAnswers;

  if (completedAnswers) {
    const choice = buildReceipt(steps, completedAnswers);
    return <QuestionFlow id={id} choice={choice} />;
  }

  return (
    <QuestionFlow
      id={id}
      steps={steps}
      onComplete={(answers: Record<string, string[]>) => {
        setLocalAnswers(answers);
        addResult(answers);
      }}
    />
  );
}

export const askQuestionFlowTool: Toolkit["ask_question_flow"] = {
  type: "human",
  parameters: { type: "object" as const, additionalProperties: true },
  render: (props) => <QuestionFlowTool {...props} />,
};
