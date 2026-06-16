import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getAllDeptScores, getInstitutionTrend, getQADashboard } from "@/src/actions/qa-analytics";
import { Badge } from "@/src/components/ui/badge";
import { formatDate, formatScore, scoreVariant } from "@/src/lib/utils";

export default async function QAReportsPage() {
  const session = await auth();
  if (session?.user?.role !== "QA_OFFICER") redirect("/");
  const [{ instAvg, responseRate, totalSubmissions, latestPeriod }, depts] = await Promise.all([
    getQADashboard(),
    getAllDeptScores(),
  ]);

  const sorted = [...depts].filter((d) => d.avgScore != null).sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0));

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Institution Report</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">
          Generated {formatDate(new Date())}
          {latestPeriod ? ` · ${latestPeriod.title}` : ""}
        </p>
      </div>

      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
        <p className="text-sm font-semibold mb-3">Executive Summary</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">Institution Avg</p>
            <p className="text-2xl font-semibold mt-0.5">{instAvg > 0 ? formatScore(instAvg) : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">Total Submissions</p>
            <p className="text-2xl font-semibold mt-0.5">{totalSubmissions}</p>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">Response Rate</p>
            <p className="text-2xl font-semibold mt-0.5">{responseRate}%</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Department Rankings</p>
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Rank", "Department", "Lecturers", "Response Rate", "Avg Score"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((d, i) => (
                <tr key={d.id} className="border-b border-[hsl(var(--border))] last:border-0">
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">#{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{d.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{d._count.lecturers}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{d.responseRate}%</td>
                  <td className="px-4 py-3"><Badge variant={scoreVariant(d.avgScore!)}>{formatScore(d.avgScore!)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
