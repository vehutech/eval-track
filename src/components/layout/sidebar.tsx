"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, Settings,
  GraduationCap, BarChart3, FileText, Building2, HelpCircle, X
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { Role } from "@/src/types/prisma";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/admin/departments", label: "Departments", icon: <Building2 className="h-4 w-4" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { href: "/admin/courses", label: "Courses", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/admin/periods", label: "Eval Periods", icon: <ClipboardList className="h-4 w-4" /> },
    { href: "/admin/questions", label: "Questions", icon: <HelpCircle className="h-4 w-4" /> },
    { href: "/admin/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ],
  STUDENT: [
    { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/student/courses", label: "My Courses", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/student/evaluate", label: "Evaluate", icon: <ClipboardList className="h-4 w-4" /> },
    { href: "/student/history", label: "History", icon: <FileText className="h-4 w-4" /> },
  ],
  LECTURER: [
    { href: "/lecturer", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/lecturer/courses", label: "My Courses", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/lecturer/evaluations", label: "Evaluations", icon: <BarChart3 className="h-4 w-4" /> },
  ],
  HOD: [
    { href: "/hod", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/hod/lecturers", label: "Lecturers", icon: <Users className="h-4 w-4" /> },
    { href: "/hod/courses", label: "Courses", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/hod/reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
  ],
  QA_OFFICER: [
    { href: "/qa", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/qa/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/qa/departments", label: "Departments", icon: <Building2 className="h-4 w-4" /> },
    { href: "/qa/reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
  ],
};

interface SidebarProps {
  role: Role;
  userName: string;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, userName, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];

  const content = (
    <div className="flex h-full flex-col bg-[hsl(var(--surface))] border-r border-[hsl(var(--border))]">
      <div className="flex items-center justify-between h-14 px-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-[hsl(var(--accent))] flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-[hsl(var(--foreground))]">EvalTrack</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = item.href === "/admin" || item.href === "/student" || item.href === "/lecturer" || item.href === "/hod" || item.href === "/qa"
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))] font-medium"
                  : "text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-subtle))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[hsl(var(--border))]">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-[hsl(var(--foreground))] truncate">{userName}</p>
          <p className="text-xs text-[hsl(var(--foreground-muted))]">{role.replace("_", " ")}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <aside className="relative w-64 flex flex-col h-screen">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
