import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getAllDeptScores } from "@/src/actions/qa-analytics";
import { Badge } from "@/src/components/ui/badge";
import { EmptyState } from "@/src/components/shared/empty-state";
import { Building2 } from "lucide-react";
import { formatScore, scoreVariant } from "@/src/lib/utils";
import Link from "next/link";

export default async function QADepartmentsPage() {
  const session = await auth();
  if (session?.user?.role !== "QA_OFFICER") redirect("/");
  const depts = await getAllDeptScores();
  const sorted = [...depts].sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Departments</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">Ranked by average score</p>
      </div>
      {sorted.length === 0 ? (
        <EmptyState icon={<Building2 className="h-5 w-5" />} title="No departments" />
      ) : (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Rank", "Department", "Code", "Lecturers", "Courses", "Responses", "Rate", "Avg Score", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((d, i) => (
                <tr key={d.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">#{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{d.name}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{d.code}</Badge></td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{d._count.lecturers}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{d._count.courses}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{d.responseCount}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{d.responseRate}%</td>
                  <td className="px-4 py-3">
                    {d.avgScore != null ? (
                      <Badge variant={scoreVariant(d.avgScore)}>{formatScore(d.avgScore)}</Badge>
                    ) : <span className="text-[hsl(var(--foreground-subtle))]">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/qa/departments/${d.id}`} className="text-xs text-[hsl(var(--accent))] hover:underline">View</Link>
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
