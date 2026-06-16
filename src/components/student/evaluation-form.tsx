"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { useToast } from "@/src/hooks/use-toast";
import { submitEvaluation } from "@/src/actions/evaluations";
import { cn } from "@/src/lib/utils";

const SCALE_LABELS: Record<number, string> = {
  1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent",
};

interface Question {
  id: string;
  text: string;
  category: string;
  order: number;
}

interface EvaluationFormProps {
  questions: Question[];
  courseId: string;
  periodId: string;
}

export function EvaluationForm({ questions, courseId, periodId }: EvaluationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const answered = Object.keys(responses).length;
  const total = questions.length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;
  const allAnswered = answered === total && total > 0;

  function setScore(questionId: string, score: number) {
    setResponses((prev) => ({ ...prev, [questionId]: score }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setLoading(true);
    try {
      await submitEvaluation({
        courseId,
        periodId,
        responses: Object.entries(responses).map(([questionId, score]) => ({ questionId, score })),
      });
      toast({ title: "Evaluation submitted", description: "Thank you for your feedback.", variant: "success" });
      router.push("/student/evaluate");
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(var(--foreground-muted))]">Progress</span>
          <span className="font-medium text-[hsl(var(--foreground))]">{answered}/{total} answered</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="flex flex-col gap-5">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={cn(
              "rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4",
              responses[q.id] && "border-[hsl(var(--accent))]"
            )}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-sm font-mono text-[hsl(var(--foreground-subtle))] shrink-0 pt-0.5">{i + 1}.</span>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{q.text}</p>
                <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">{q.category}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((score) => (
                <label
                  key={score}
                  className={cn(
                    "flex flex-col items-center gap-1 cursor-pointer p-2 rounded-[var(--radius)] border-2 transition-all flex-1 min-w-[60px]",
                    responses[q.id] === score
                      ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent-subtle))]"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--border-strong))]"
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={score}
                    checked={responses[q.id] === score}
                    onChange={() => setScore(q.id, score)}
                    className="sr-only"
                  />
                  <span className={cn(
                    "text-lg font-bold",
                    responses[q.id] === score ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--foreground-muted))]"
                  )}>{score}</span>
                  <span className="text-xs text-center text-[hsl(var(--foreground-muted))]">{SCALE_LABELS[score]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={!allAnswered} loading={loading} className="w-full">
        {allAnswered ? "Submit Evaluation" : `Answer ${total - answered} more question(s)`}
      </Button>
    </form>
  );
}
