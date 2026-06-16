import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getStudentCourses } from "@/src/actions/evaluations";
import { Badge } from "@/src/components/ui/badge";
import { EmptyState } from "@/src/components/shared/empty-state";
import { BookOpen } from "lucide-react";

export default async function StudentCoursesPage() {
  const session = await auth();
  if (session?.user?.role !== "STUDENT") redirect("/");
  const courses = await getStudentCourses();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">My Courses</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">{courses.length} enrolled</p>
      </div>
      {courses.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-5 w-5" />} title="No courses enrolled" description="Contact admin to enrol you in courses." />
      ) : (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Code", "Title", "Lecturer", "Department", "Level", "Sem", "Units"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-4 py-3"><Badge variant="outline">{c.code}</Badge></td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{c.title}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.lecturer.user.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.department.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.level}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.semester}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{c.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
