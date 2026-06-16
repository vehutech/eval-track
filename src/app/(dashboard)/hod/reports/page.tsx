import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getDeptLecturerScores, getDeptTrend, getHODDashboard } from "@/src/actions/hod-reports";
import { HODReportCharts } from "@/src/components/hod/dept-report";

export default async function HODReportsPage() {
  const session = await auth();
  if (session?.user?.role !== "HOD") redirect("/");
  const [{ department }, lecturers, trend] = await Promise.all([
    getHODDashboard(),
    getDeptLecturerScores(),
    getDeptTrend(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Department Reports</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">{department.name}</p>
      </div>
      <HODReportCharts lecturers={lecturers} trend={trend} />
    </div>
  );
}
