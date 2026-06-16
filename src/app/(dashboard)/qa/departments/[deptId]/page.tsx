import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getDeptDetail } from "@/src/actions/qa-analytics";
import { StatCard } from "@/src/components/shared/stat-card";
import { Badge } from "@/src/components/ui/badge";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { formatScore, scoreVariant } from "@/src/lib/utils";

export default async function QADeptDetailPage({ params }: { params: Promise<{ deptId: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "QA_OFFICER") redirect("/");
  const { deptId } = await params;

  let detail;
  try {
    detail = await getDeptDetail(deptId);
  } catch {
    redirect("/qa/departments");
  }

  const { dept, lecturerScores, courseScores } = detail;
  const lecturerAvg = lecturerScores.filter((l) => l.avgScore != null);
  const deptAvg = lecturerAvg.length > 0
    ? lecturerAvg.reduce((s, l) => s + l.avgScore!, 0) / lecturerAvg.length
    : 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <Link href="/qa/departments" className="flex items-center gap-1.5 text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] mb-3">
          <ArrowLeft className="h-4 w-4" />Back to departments
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">{dept.name}</h1>
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              Code: {dept.code} {dept.hod && `· HOD: ${dept.hod.user.name}`}
            </p>
          </div>
          {deptAvg > 0 && <Badge variant={scoreVariant(deptAvg)} className="text-base px-3 py-1">{formatScore(deptAvg)}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Lecturers" value={lecturerScores.length} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Courses" value={courseScores.length} icon={<BookOpen className="h-4 w-4" />} />
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Lecturer Scores</p>
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Lecturer", "Responses", "Avg Score"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lecturerScores.sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0)).map((l) => (
                <tr key={l.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{l.user.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{l.responseCount}</td>
                  <td className="px-4 py-3">
                    {l.avgScore != null ? <Badge variant={scoreVariant(l.avgScore)}>{formatScore(l.avgScore)}</Badge> : <span className="text-[hsl(var(--foreground-subtle))]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Course Scores</p>
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Code", "Title", "Lecturer", "Responses", "Avg Score"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courseScores.sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0)).map((c) => (
                <tr key={c.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-4 py-3"><Badge variant="outline">{c.code}</Badge></td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{c.title}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.lecturer.user.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.responseCount}</td>
                  <td className="px-4 py-3">
                    {c.avgScore != null ? <Badge variant={scoreVariant(c.avgScore)}>{formatScore(c.avgScore)}</Badge> : <span className="text-[hsl(var(--foreground-subtle))]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
