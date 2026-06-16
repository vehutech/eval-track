import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getLecturerDashboardStats } from "@/src/actions/lecturer-results";
import { StatCard } from "@/src/components/shared/stat-card";
import { Badge } from "@/src/components/ui/badge";
import { BookOpen, BarChart3, Star } from "lucide-react";
import { formatScore } from "@/src/lib/utils";

export default async function LecturerDashboard() {
  const session = await auth();
  if (session?.user?.role !== "LECTURER") redirect("/");
  const { courseCount, totalResponses, avgScore, latestPeriod } = await getLecturerDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {session.user.name}</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">Lecturer dashboard</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Active Courses" value={courseCount} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard title="Total Responses" value={totalResponses} icon={<BarChart3 className="h-4 w-4" />} />
        <StatCard title="Overall Avg Score" value={avgScore > 0 ? formatScore(avgScore) : "—"} icon={<Star className="h-4 w-4" />} />
      </div>
      {latestPeriod && (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{latestPeriod.title}</p>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">Latest evaluation period</p>
          </div>
          <Badge variant={latestPeriod.status === "ACTIVE" ? "success" : "outline"}>{latestPeriod.status}</Badge>
        </div>
      )}
    </div>
  );
}
