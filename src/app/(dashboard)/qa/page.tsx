import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getQADashboard, getAllDeptScores } from "@/src/actions/qa-analytics";
import { StatCard } from "@/src/components/shared/stat-card";
import { Badge } from "@/src/components/ui/badge";
import { Building2, Users, BarChart3, Star, ClipboardList } from "lucide-react";
import { formatScore, scoreVariant } from "@/src/lib/utils";

export default async function QADashboard() {
  const session = await auth();
  if (session?.user?.role !== "QA_OFFICER") redirect("/");
  const [{ deptCount, lecturerCount, totalSubmissions, instAvg, responseRate, latestPeriod }, depts] =
    await Promise.all([getQADashboard(), getAllDeptScores()]);

  const ranked = [...depts].filter((d) => d.avgScore != null).sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0));
  const top3 = ranked.slice(0, 3);
  const bottom3 = ranked.slice(-3).reverse();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Institution Overview</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">QA Officer dashboard</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard title="Departments" value={deptCount} icon={<Building2 className="h-4 w-4" />} />
        <StatCard title="Lecturers" value={lecturerCount} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Institution Avg" value={instAvg > 0 ? formatScore(instAvg) : "—"} icon={<Star className="h-4 w-4" />} />
        <StatCard title="Response Rate" value={`${responseRate}%`} icon={<BarChart3 className="h-4 w-4" />} />
        <StatCard title="Total Submissions" value={totalSubmissions} icon={<ClipboardList className="h-4 w-4" />} />
      </div>

      {latestPeriod && (
        <div className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3">
          <div>
            <p className="text-sm font-medium">{latestPeriod.title}</p>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">Latest period</p>
          </div>
          <Badge variant={latestPeriod.status === "ACTIVE" ? "success" : "outline"}>{latestPeriod.status}</Badge>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold mb-2">Top Performing Departments</p>
          {top3.length === 0 ? <p className="text-sm text-[hsl(var(--foreground-muted))]">No data yet.</p> : (
            <div className="flex flex-col gap-2">
              {top3.map((d, i) => (
                <div key={d.id} className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[hsl(var(--foreground-subtle))]">#{i + 1}</span>
                    <span className="text-sm font-medium">{d.name}</span>
                  </div>
                  <Badge variant={scoreVariant(d.avgScore!)}>{formatScore(d.avgScore!)}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">Departments Needing Attention</p>
          {bottom3.length === 0 ? <p className="text-sm text-[hsl(var(--foreground-muted))]">No data yet.</p> : (
            <div className="flex flex-col gap-2">
              {bottom3.map((d, i) => (
                <div key={d.id} className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[hsl(var(--foreground-subtle))]">#{ranked.length - i}</span>
                    <span className="text-sm font-medium">{d.name}</span>
                  </div>
                  <Badge variant={scoreVariant(d.avgScore!)}>{formatScore(d.avgScore!)}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
