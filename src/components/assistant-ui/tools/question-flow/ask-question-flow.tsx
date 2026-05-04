"use client";

import { type Toolkit } from "@assistant-ui/react";
import { useState } from "react";
import { QuestionFlow } from "@/components/tool-ui/question-flow";

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
    return null;

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
