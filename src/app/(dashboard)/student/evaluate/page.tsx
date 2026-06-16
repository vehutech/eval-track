import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getPendingEvaluations } from "@/src/actions/evaluations";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { EmptyState } from "@/src/components/shared/empty-state";
import { ClipboardList, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function EvaluatePage() {
  const session = await auth();
  if (session?.user?.role !== "STUDENT") redirect("/");
  const { period, courses } = await getPendingEvaluations();

  if (!period) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Evaluate</h1>
        <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="No active evaluation period" description="Evaluations will appear here when an active period is open." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Evaluate</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">
          Active period: <strong>{period.title}</strong>
        </p>
      </div>
      {courses.length === 0 ? (
        <EmptyState title="No courses to evaluate" description="Your enrolled courses are not in the current evaluation period." />
      ) : (
        <div className="flex flex-col gap-3">
          {courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{c.code}</Badge>
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">{c.title}</span>
                </div>
                <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">{c.lecturer.user.name} · {c.department.name}</p>
              </div>
              {c.submitted ? (
                <div className="flex items-center gap-1.5 text-[hsl(var(--success))]">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Submitted</span>
                </div>
              ) : (
                <Button asChild size="sm"><Link href={`/student/evaluate/${c.id}`}>Evaluate</Link></Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
