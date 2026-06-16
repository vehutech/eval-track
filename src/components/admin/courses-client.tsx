"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { createCourse, updateCourse, deleteCourse, getLecturersByDept } from "@/src/actions/courses";
import { Plus, Pencil, Trash2, Search, BookOpen, Users } from "lucide-react";
import { EmptyState } from "@/src/components/shared/empty-state";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Dept = { id: string; name: string; code: string };
type Course = {
  id: string; title: string; code: string; unit: number; semester: number; level: number;
  department: { name: string }; lecturer: { user: { name: string } };
  _count: { enrollments: number };
};

const emptyForm = { title: "", code: "", unit: "3", departmentId: "", lecturerId: "", semester: "1", level: "100" };

export function CoursesClient({ courses, departments }: { courses: Course[]; departments: Dept[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [lecturers, setLecturers] = useState<{ id: string; user: { name: string } }[]>([]);
  const [loading, setLoading] = useState(false);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    const matchDept = deptFilter === "ALL" || c.department.name === departments.find((d) => d.id === deptFilter)?.name;
    return matchSearch && matchDept;
  });

  async function loadLecturers(deptId: string) {
    if (!deptId) return setLecturers([]);
    const data = await getLecturersByDept(deptId);
    setLecturers(data);
  }

  async function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setLecturers([]);
    setOpen(true);
  }

  async function openEdit(c: Course) {
    setEditing(c);
    const deptId = departments.find((d) => d.name === c.department.name)?.id ?? "";
    setForm({
      title: c.title, code: c.code, unit: String(c.unit),
      departmentId: deptId, lecturerId: "",
      semester: String(c.semester), level: String(c.level),
    });
    if (deptId) await loadLecturers(deptId);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, unit: parseInt(form.unit), semester: parseInt(form.semester), level: parseInt(form.level) };
      if (editing) {
        await updateCourse(editing.id, data);
        toast({ title: "Course updated", variant: "success" });
      } else {
        await createCourse(data);
        toast({ title: "Course created", variant: "success" });
      }
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(c: Course) {
    if (!confirm(`Delete course "${c.code} — ${c.title}"?`)) return;
    try {
      await deleteCourse(c.id);
      toast({ title: "Course deleted", variant: "success" });
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Courses</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">{courses.length} total</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" />New Course</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--foreground-subtle))]" />
          <Input placeholder="Search courses..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All departments" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All departments</SelectItem>
            {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-5 w-5" />} title="No courses found" />
      ) : (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Code", "Title", "Dept", "Lecturer", "Level", "Sem", "Units", "Enrolled", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-3 py-2.5"><Badge variant="outline">{c.code}</Badge></td>
                  <td className="px-3 py-2.5 font-medium text-[hsl(var(--foreground))]">{c.title}</td>
                  <td className="px-3 py-2.5 text-[hsl(var(--foreground-muted))]">{c.department.name}</td>
                  <td className="px-3 py-2.5 text-[hsl(var(--foreground-muted))]">{c.lecturer.user.name}</td>
                  <td className="px-3 py-2.5 text-[hsl(var(--foreground-muted))]">{c.level}</td>
                  <td className="px-3 py-2.5 text-[hsl(var(--foreground-muted))]">{c.semester}</td>
                  <td className="px-3 py-2.5 text-[hsl(var(--foreground-muted))]">{c.unit}</td>
                  <td className="px-3 py-2.5 text-[hsl(var(--foreground-muted))]">{c._count.enrollments}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" asChild><Link href={`/admin/courses/${c.id}/enroll`}><Users className="h-3.5 w-3.5" /></Link></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c)}><Trash2 className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Course" : "New Course"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Department</Label>
              <Select value={form.departmentId} onValueChange={(v) => { setForm({ ...form, departmentId: v, lecturerId: "" }); loadLecturers(v); }}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Lecturer</Label>
              <Select value={form.lecturerId} onValueChange={(v) => setForm({ ...form, lecturerId: v })} disabled={!form.departmentId}>
                <SelectTrigger><SelectValue placeholder="Select lecturer" /></SelectTrigger>
                <SelectContent>
                  {lecturers.map((l) => <SelectItem key={l.id} value={l.id}>{l.user.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["100","200","300","400","500"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Semester</Label>
                <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Units</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1","2","3","4","6"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={loading}>{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
