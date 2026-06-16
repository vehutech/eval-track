"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useToast } from "@/src/hooks/use-toast";
import { addEnrollment, removeEnrollment } from "@/src/actions/courses";
import { UserPlus, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/src/components/shared/empty-state";

type Student = { id: string; level: number; user: { name: string; email: string } };
type Enrollment = { id: string; studentId: string; student: Student };
type Course = {
  id: string; title: string; code: string; level: number; semester: number;
  department: { name: string }; lecturer: { user: { name: string } };
};

export function EnrollmentsClient({
  course, enrollments, available,
}: { course: Course; enrollments: Enrollment[]; available: Student[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function handleAdd() {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      for (const id of selectedIds) await addEnrollment(course.id, id);
      toast({ title: `${selectedIds.length} student(s) enrolled`, variant: "success" });
      setSelectedIds([]);
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(studentId: string) {
    if (!confirm("Remove this student from the course?")) return;
    try {
      await removeEnrollment(course.id, studentId);
      toast({ title: "Student removed", variant: "success" });
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/courses" className="flex items-center gap-1.5 text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
        <h1 className="text-xl font-semibold">{course.code} — Enrollments</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">
          {course.title} · {course.department.name} · Level {course.level} · Semester {course.semester}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Enrolled Students ({enrollments.length})</h2>
          </div>
          {enrollments.length === 0 ? (
            <EmptyState title="No students enrolled yet" />
          ) : (
            <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                    <th className="px-3 py-2.5 text-left font-medium text-[hsl(var(--foreground-muted))]">Name</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.id} className="border-b border-[hsl(var(--border))] last:border-0">
                      <td className="px-3 py-2.5 text-[hsl(var(--foreground))]">{e.student.user.name}</td>
                      <td className="px-3 py-2.5 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(e.studentId)}>
                          <Trash2 className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Available Students ({available.length})</h2>
            {selectedIds.length > 0 && (
              <Button size="sm" onClick={handleAdd} loading={loading}>
                <UserPlus className="h-4 w-4 mr-1" />Enroll {selectedIds.length}
              </Button>
            )}
          </div>
          {available.length === 0 ? (
            <EmptyState title="All eligible students are enrolled" />
          ) : (
            <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                    <th className="px-3 py-2.5 w-8" />
                    <th className="px-3 py-2.5 text-left font-medium text-[hsl(var(--foreground-muted))]">Name</th>
                    <th className="px-3 py-2.5 text-left font-medium text-[hsl(var(--foreground-muted))]">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {available.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[hsl(var(--border))] last:border-0 cursor-pointer hover:bg-[hsl(var(--background-subtle))]"
                      onClick={() => toggleSelect(s.id)}
                    >
                      <td className="px-3 py-2.5">
                        <input type="checkbox" checked={selectedIds.includes(s.id)} readOnly className="accent-[hsl(var(--accent))]" />
                      </td>
                      <td className="px-3 py-2.5 text-[hsl(var(--foreground))]">{s.user.name}</td>
                      <td className="px-3 py-2.5"><Badge variant="outline">{s.level}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
