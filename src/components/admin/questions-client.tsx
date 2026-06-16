"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { createQuestion, updateQuestion, deleteQuestion } from "@/src/actions/questions";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import { EmptyState } from "@/src/components/shared/empty-state";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Delivery", "Punctuality", "Assessment", "Interaction", "Resources", "Overall"];

type Question = { id: string; text: string; category: string; order: number };

export function QuestionsClient({ questions }: { questions: Question[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState({ text: "", category: "Delivery", order: "1" });
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ text: "", category: "Delivery", order: String(questions.length + 1) });
    setOpen(true);
  }

  function openEdit(q: Question) {
    setEditing(q);
    setForm({ text: q.text, category: q.category, order: String(q.order) });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, order: parseInt(form.order) };
      if (editing) {
        await updateQuestion(editing.id, data);
        toast({ title: "Question updated", variant: "success" });
      } else {
        await createQuestion(data);
        toast({ title: "Question created", variant: "success" });
      }
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id);
      toast({ title: "Question deleted", variant: "success" });
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Evaluation Questions</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">{questions.length} questions</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" />New Question</Button>
      </div>

      {questions.length === 0 ? (
        <EmptyState icon={<HelpCircle className="h-5 w-5" />} title="No questions yet"
          action={<Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" />New Question</Button>}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="flex items-start justify-between gap-4 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-sm font-mono text-[hsl(var(--foreground-subtle))] pt-0.5 w-5 shrink-0">{i + 1}.</span>
                <div>
                  <p className="text-sm text-[hsl(var(--foreground))]">{q.text}</p>
                  <Badge variant="outline" className="mt-1">{q.category}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(q)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}><Trash2 className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Question" : "New Question"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Question Text</Label>
              <Input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required placeholder="The lecturer explains concepts clearly." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Order</Label>
                <Input type="number" min={1} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
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
