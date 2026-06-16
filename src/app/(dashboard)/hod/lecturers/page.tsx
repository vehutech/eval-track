import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getDeptLecturerScores } from "@/src/actions/hod-reports";
import { Badge } from "@/src/components/ui/badge";
import { EmptyState } from "@/src/components/shared/empty-state";
import { Users } from "lucide-react";
import { formatScore, scoreVariant } from "@/src/lib/utils";

export default async function HODLecturersPage() {
  const session = await auth();
  if (session?.user?.role !== "HOD") redirect("/");
  const lecturers = await getDeptLecturerScores();
  const sorted = [...lecturers].sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Lecturers</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">Ranked by average score</p>
      </div>
      {sorted.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No lecturers in department" />
      ) : (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Rank", "Name", "Courses", "Responses", "Avg Score"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((l, i) => (
                <tr key={l.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">#{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{l.user.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{l.courses.length}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{l.responseCount}</td>
                  <td className="px-4 py-3">
                    {l.avgScore != null ? (
                      <Badge variant={scoreVariant(l.avgScore)}>{formatScore(l.avgScore)}</Badge>
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
