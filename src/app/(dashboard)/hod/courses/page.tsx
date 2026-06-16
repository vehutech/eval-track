import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getDeptCourseScores } from "@/src/actions/hod-reports";
import { Badge } from "@/src/components/ui/badge";
import { EmptyState } from "@/src/components/shared/empty-state";
import { BookOpen } from "lucide-react";
import { formatScore, scoreVariant } from "@/src/lib/utils";

export default async function HODCoursesPage() {
  const session = await auth();
  if (session?.user?.role !== "HOD") redirect("/");
  const courses = await getDeptCourseScores();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Courses</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">{courses.length} in department</p>
      </div>
      {courses.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-5 w-5" />} title="No courses in department" />
      ) : (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Code", "Title", "Lecturer", "Level", "Responses", "Avg Score"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-4 py-3"><Badge variant="outline">{c.code}</Badge></td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{c.title}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.lecturer.user.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.level}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.responseCount}</td>
                  <td className="px-4 py-3">
                    {c.avgScore != null ? (
                      <Badge variant={scoreVariant(c.avgScore)}>{formatScore(c.avgScore)}</Badge>
                    ) : <span className="text-[hsl(var(--foreground-subtle))]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
