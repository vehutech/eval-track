"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { EmptyState } from "@/src/components/shared/empty-state";
import { useToast } from "@/src/hooks/use-toast";
import { createDepartment, updateDepartment, deleteDepartment } from "@/src/actions/departments";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Dept = {
  id: string;
  name: string;
  code: string;
  _count: { lecturers: number; students: number; courses: number };
};

export function DepartmentsClient({ departments }: { departments: Dept[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dept | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setName("");
    setCode("");
    setOpen(true);
  }

  function openEdit(d: Dept) {
    setEditing(d);
    setName(d.name);
    setCode(d.code);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateDepartment(editing.id, { name, code });
        toast({ title: "Department updated", variant: "success" });
      } else {
        await createDepartment({ name, code });
        toast({ title: "Department created", variant: "success" });
      }
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(d: Dept) {
    if (!confirm(`Delete "${d.name}"? This cannot be undone.`)) return;
    try {
      await deleteDepartment(d.id);
      toast({ title: "Department deleted", variant: "success" });
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Departments</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">{departments.length} total</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Department
        </Button>
      </div>

      {departments.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-5 w-5" />}
          title="No departments yet"
          description="Create your first department to get started."
          action={<Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" />New Department</Button>}
        />
      ) : (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                <th className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">Name</th>
                <th className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">Code</th>
                <th className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">Lecturers</th>
                <th className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">Students</th>
                <th className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">Courses</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{d.name}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{d.code}</Badge></td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{d._count.lecturers}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{d._count.students}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{d._count.courses}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(d)}>
                        <Trash2 className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
                      </Button>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Department" : "New Department"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dept-name">Name</Label>
              <Input id="dept-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Computer Science" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dept-code">Code</Label>
              <Input id="dept-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="CS" />
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
