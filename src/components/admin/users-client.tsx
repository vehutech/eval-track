"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { createUser, deleteUser, resetUserPassword } from "@/src/actions/users";
import { Plus, Trash2, KeyRound, Search, Users } from "lucide-react";
import { EmptyState } from "@/src/components/shared/empty-state";
import { useRouter } from "next/navigation";
import type { Role } from "@/src/types/prisma";

const ROLES: Role[] = ["ADMIN", "QA_OFFICER", "HOD", "LECTURER", "STUDENT"];
const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator", QA_OFFICER: "QA Officer", HOD: "Head of Dept",
  LECTURER: "Lecturer", STUDENT: "Student",
};

type Dept = { id: string; name: string; code: string };
type User = {
  id: string; name: string; email: string; role: string;
  staffId: string | null; studentId: string | null;
  lecturer: { department: { name: string } } | null;
  student: { department: { name: string } } | null;
  hod: { department: { name: string } } | null;
};

export function UsersClient({ users, departments }: { users: User[]; departments: Dept[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" as Role, departmentId: "", level: "100", staffId: "", studentId: "" });

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser({
        ...form,
        level: parseInt(form.level),
        departmentId: form.departmentId || undefined,
        staffId: form.staffId || undefined,
        studentId: form.studentId || undefined,
      });
      toast({ title: "User created", variant: "success" });
      setCreateOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Delete user "${user.name}"?`)) return;
    try {
      await deleteUser(user.id);
      toast({ title: "User deleted", variant: "success" });
      router.refresh();
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetOpen) return;
    setLoading(true);
    try {
      await resetUserPassword({ userId: resetOpen.id, newPassword });
      toast({ title: "Password reset", variant: "success" });
      setResetOpen(null);
      setNewPassword("");
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const needsDept = ["STUDENT", "LECTURER", "HOD"].includes(form.role);
  const needsLevel = form.role === "STUDENT";

  function getDeptForUser(u: User) {
    return u.lecturer?.department.name ?? u.student?.department.name ?? u.hod?.department.name ?? "—";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">{users.length} total</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New User
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--foreground-subtle))]" />
          <Input placeholder="Search by name or email..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No users found" />
      ) : (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Name", "Email", "Role", "Department", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{u.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant="default">{ROLE_LABELS[u.role as Role]}</Badge></td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{getDeptForUser(u)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => { setResetOpen(u); setNewPassword(""); }}><KeyRound className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u)}><Trash2 className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New User</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role, departmentId: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {needsDept && (
              <div className="flex flex-col gap-1.5">
                <Label>Department</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {needsLevel && (
              <div className="flex flex-col gap-1.5">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["100", "200", "300", "400", "500"].map((l) => <SelectItem key={l} value={l}>{l} Level</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {["LECTURER", "HOD", "QA_OFFICER", "ADMIN"].includes(form.role) && (
              <div className="flex flex-col gap-1.5">
                <Label>Staff ID <span className="text-[hsl(var(--foreground-subtle))]">(optional)</span></Label>
                <Input value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" loading={loading}>Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetOpen} onOpenChange={() => setResetOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password — {resetOpen?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetOpen(null)}>Cancel</Button>
              <Button type="submit" loading={loading}>Reset</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
