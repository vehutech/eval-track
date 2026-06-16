import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { StatCard } from "@/src/components/shared/stat-card";
import { Badge } from "@/src/components/ui/badge";
import { Users, Building2, BookOpen, GraduationCap, ClipboardList } from "lucide-react";
import { formatDate } from "@/src/lib/utils";

export default async function AdminDashboard() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const [userCount, deptCount, courseCount, lecturerCount, studentCount, activePeriod, recentPeriods] =
    await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.course.count(),
      prisma.lecturer.count(),
      prisma.student.count(),
      prisma.evaluationPeriod.findFirst({ where: { status: "ACTIVE" } }),
      prisma.evaluationPeriod.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { submissions: true } } },
      }),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Dashboard</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">
          Institution overview and quick stats
        </p>
      </div>

      {activePeriod && (
        <div className="rounded-[var(--radius)] bg-[hsl(var(--accent-subtle))] border border-[hsl(var(--accent))] px-4 py-3 flex items-center gap-3">
          <ClipboardList className="h-4 w-4 text-[hsl(var(--accent))] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--accent))]">Active Evaluation Period</p>
            <p className="text-xs text-[hsl(var(--accent))]">{activePeriod.title} — ends {formatDate(activePeriod.endDate)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Total Users" value={userCount} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Departments" value={deptCount} icon={<Building2 className="h-4 w-4" />} />
        <StatCard title="Courses" value={courseCount} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard title="Lecturers" value={lecturerCount} icon={<GraduationCap className="h-4 w-4" />} />
        <StatCard title="Students" value={studentCount} icon={<Users className="h-4 w-4" />} />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3 text-[hsl(var(--foreground))]">Recent Evaluation Periods</h2>
        <div className="flex flex-col gap-2">
          {recentPeriods.length === 0 && (
            <p className="text-sm text-[hsl(var(--foreground-muted))]">No evaluation periods yet.</p>
          )}
          {recentPeriods.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{p.title}</p>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">
                  {p.academicYear} · Semester {p.semester} · {p._count.submissions} submissions
                </p>
              </div>
              <Badge
                variant={p.status === "ACTIVE" ? "success" : p.status === "CLOSED" ? "outline" : "default"}
              >
                {p.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
