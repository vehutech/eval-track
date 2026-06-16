import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getLecturerEvaluationPeriods } from "@/src/actions/lecturer-results";
import { Badge } from "@/src/components/ui/badge";
import { EmptyState } from "@/src/components/shared/empty-state";
import { BarChart3 } from "lucide-react";
import { formatScore, scoreVariant } from "@/src/lib/utils";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export default async function LecturerEvaluationsPage() {
  const session = await auth();
  if (session?.user?.role !== "LECTURER") redirect("/");
  const periods = await getLecturerEvaluationPeriods();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">My Evaluations</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">Results by period</p>
      </div>
      {periods.length === 0 ? (
        <EmptyState icon={<BarChart3 className="h-5 w-5" />} title="No evaluation results yet" />
      ) : (
        <div className="flex flex-col gap-4">
          {periods.map((p) => (
            <div key={p.id} className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{p.title}</p>
                  <p className="text-xs text-[hsl(var(--foreground-muted))]">{p.academicYear} · Semester {p.semester}</p>
                </div>
                <div className="flex items-center gap-3">
                  {p.avgScore != null && (
                    <Badge variant={scoreVariant(p.avgScore)}>Avg {formatScore(p.avgScore)}</Badge>
                  )}
                  <Badge variant={p.status === "ACTIVE" ? "success" : "outline"}>{p.status}</Badge>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-[hsl(var(--foreground-muted))] mb-2">{p.submissionCount} responses</p>
                <div className="flex flex-wrap gap-2">
                  {p.periodCourses.filter((pc) => pc.course).map((pc) => (
                    <Button key={pc.courseId} asChild size="sm" variant="outline">
                      <Link href={`/lecturer/evaluations/${p.id}/${pc.courseId}`}>
                        {pc.course.code}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
