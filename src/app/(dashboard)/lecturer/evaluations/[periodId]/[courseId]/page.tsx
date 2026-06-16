import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getLecturerCourseResult } from "@/src/actions/lecturer-results";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatScore, scoreVariant } from "@/src/lib/utils";
import { ResultChart } from "@/src/components/lecturer/result-detail";

export default async function LecturerResultDetailPage({
  params,
}: {
  params: Promise<{ periodId: string; courseId: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "LECTURER") redirect("/");
  const { periodId, courseId } = await params;

  let result;
  try {
    result = await getLecturerCourseResult(periodId, courseId);
  } catch {
    redirect("/lecturer/evaluations");
  }

  const { course, period, submissionCount, overall, questionBreakdown, categoryBreakdown } = result;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Link href="/lecturer/evaluations" className="flex items-center gap-1.5 text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to evaluations
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{course.code} — {course.title}</h1>
            <p className="text-sm text-[hsl(var(--foreground-muted))]">{period.title} · {submissionCount} responses</p>
          </div>
          <Badge variant={scoreVariant(overall)} className="text-base px-3 py-1">{formatScore(overall)}</Badge>
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
        <p className="text-sm font-semibold mb-3">Category Breakdown</p>
        <ResultChart data={categoryBreakdown} />
      </div>

      <Separator />

      <div>
        <p className="text-sm font-semibold mb-3">Question Breakdown</p>
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["#", "Question", "Category", "Avg"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questionBreakdown.map(({ question, avg }, i) => (
                <tr key={question.id} className="border-b border-[hsl(var(--border))] last:border-0">
                  <td className="px-4 py-3 text-[hsl(var(--foreground-subtle))]">{i + 1}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground))]">{question.text}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{question.category}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-[hsl(var(--background-subtle))] w-20 overflow-hidden">
                        <div className="h-full bg-[hsl(var(--accent))] rounded-full" style={{ width: `${(avg / 5) * 100}%` }} />
                      </div>
                      <Badge variant={scoreVariant(avg)}>{formatScore(avg)}</Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-[hsl(var(--foreground-muted))]">
        * Scores are averages of anonymous student responses. Individual responses are confidential.
      </p>
    </div>
  );
}
