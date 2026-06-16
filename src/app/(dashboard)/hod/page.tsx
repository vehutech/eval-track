import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getHODDashboard } from "@/src/actions/hod-reports";
import { StatCard } from "@/src/components/shared/stat-card";
import { Badge } from "@/src/components/ui/badge";
import { Users, BookOpen, Star, BarChart3 } from "lucide-react";
import { formatScore } from "@/src/lib/utils";

export default async function HODDashboard() {
  const session = await auth();
  if (session?.user?.role !== "HOD") redirect("/");
  const { department, lecturerCount, courseCount, avgScore, responseRate, activePeriod } =
    await getHODDashboard();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{department.name}</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">Department overview</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard title="Lecturers" value={lecturerCount} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Courses" value={courseCount} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard title="Avg Score" value={avgScore > 0 ? formatScore(avgScore) : "—"} icon={<Star className="h-4 w-4" />} />
        <StatCard title="Response Rate" value={`${responseRate}%`} icon={<BarChart3 className="h-4 w-4" />} />
      </div>
      {activePeriod && (
        <div className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3">
          <div>
            <p className="text-sm font-medium">{activePeriod.title}</p>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">Currently active</p>
          </div>
          <Badge variant="success">ACTIVE</Badge>
        </div>
      )}
    </div>
  );
}
