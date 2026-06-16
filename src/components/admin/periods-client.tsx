"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { createPeriod, activatePeriod, closePeriod, deletePeriod } from "@/src/actions/periods";
import { Plus, Play, Square, Trash2, ClipboardList } from "lucide-react";
import { EmptyState } from "@/src/components/shared/empty-state";
import { formatDate } from "@/src/lib/utils";
import { useRouter } from "next/navigation";

type Course = { id: string; code: string; title: string };
type Period = {
  id: string; title: string; academicYear: string; semester: number;
  startDate: Date | string; endDate: Date | string; status: "DRAFT" | "ACTIVE" | "CLOSED";
  periodCourses: { courseId: string; course: Course }[];
  _count: { submissions: number };
};

const emptyForm = {
  title: "", academicYear: "", semester: "1",
  startDate: "", endDate: "", courseIds: [] as string[],
};

export function PeriodsClient({ periods, courses }: { periods: Period[]; courses: Course[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  function toggleCourse(id: string) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id) ? f.courseIds.filter((c) => c !== id) : [...f.courseIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createPeriod({ ...form, semester: parseInt(form.semester) });
      toast({ title: "Period created", variant: "success" });
      setOpen(false);
      setForm(emptyForm);
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate(id: string) {
    try {
      await activatePeriod(id);
      toast({ title: "Period activated", variant: "success" });
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  async function handleClose(id: string) {
    if (!confirm("Close this evaluation period? This cannot be undone.")) return;
    try {
      await closePeriod(id);
      toast({ title: "Period closed", variant: "success" });
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this period?")) return;
    try {
      await deletePeriod(id);
      toast({ title: "Period deleted", variant: "success" });
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  const statusVariant = (s: string) =>
    s === "ACTIVE" ? "success" : s === "CLOSED" ? "outline" : "default";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Evaluation Periods</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">{periods.length} total</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" />New Period</Button>
      </div>

      {periods.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="No evaluation periods yet"
          action={<Button onClick={() => setOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" />New Period</Button>}
        />
      ) : (
        <div className="grid gap-4">
          {periods.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                      {p.academicYear} · Semester {p.semester} · {formatDate(p.startDate)} — {formatDate(p.endDate)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(p.status) as never}>{p.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex flex-wrap gap-1">
                    {p.periodCourses.slice(0, 4).map((pc) => (
                      <Badge key={pc.courseId} variant="outline">{pc.course.code}</Badge>
                    ))}
                    {p.periodCourses.length > 4 && (
                      <Badge variant="outline">+{p.periodCourses.length - 4} more</Badge>
                    )}
                    <span className="text-xs text-[hsl(var(--foreground-muted))] ml-1 self-center">
                      · {p._count.submissions} submissions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status === "DRAFT" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleActivate(p.id)}>
                          <Play className="h-3.5 w-3.5 mr-1" />Activate
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />
                        </Button>
                      </>
                    )}
                    {p.status === "ACTIVE" && (
                      <Button variant="outline" size="sm" onClick={() => handleClose(p.id)}>
                        <Square className="h-3.5 w-3.5 mr-1" />Close
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Evaluation Period</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="First Semester 2024/2025" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Academic Year</Label>
                <Input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} required placeholder="2024/2025" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Semester</Label>
                <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First</SelectItem>
                    <SelectItem value="2">Second</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Courses ({form.courseIds.length} selected)</Label>
              <div className="max-h-48 overflow-y-auto rounded-[var(--radius)] border border-[hsl(var(--border))] p-2 flex flex-col gap-1">
                {courses.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded hover:bg-[hsl(var(--background-subtle))]">
                    <input type="checkbox" checked={form.courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} className="accent-[hsl(var(--accent))]" />
                    <span className="font-mono text-xs text-[hsl(var(--foreground-muted))]">{c.code}</span>
                    <span className="text-[hsl(var(--foreground))]">{c.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={loading}>Create Period</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
