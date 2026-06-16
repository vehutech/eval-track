import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getStudentCourses, getPendingEvaluations, getSubmissionHistory } from "@/src/actions/evaluations";
import { StatCard } from "@/src/components/shared/stat-card";
import { Button } from "@/src/components/ui/button";
import { BookOpen, ClipboardList, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await auth();
  if (session?.user?.role !== "STUDENT") redirect("/");

  const [courses, { period, courses: pending }, history] = await Promise.all([
    getStudentCourses(),
    getPendingEvaluations(),
    getSubmissionHistory(),
  ]);

  const pendingCount = pending.filter((c) => !c.submitted).length;
  const completedCount = history.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {session.user.name}</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">Student dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Enrolled Courses" value={courses.length} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard title="Pending Evaluations" value={pendingCount} icon={<ClipboardList className="h-4 w-4" />}
          description={period ? `Active: ${period.title}` : "No active period"} />
        <StatCard title="Completed Evaluations" value={completedCount} icon={<CheckCircle className="h-4 w-4" />} />
      </div>

      {period && pendingCount > 0 && (
        <div className="rounded-[var(--radius)] bg-[hsl(var(--accent-subtle))] border border-[hsl(var(--accent))] px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[hsl(var(--accent))]">Evaluations due</p>
            <p className="text-xs text-[hsl(var(--accent))]">{pendingCount} course(s) pending in {period.title}</p>
          </div>
          <Button asChild size="sm"><Link href="/student/evaluate">Evaluate Now</Link></Button>
        </div>
      )}
    </div>
  );
}
