import type { Role } from "@/src/types/prisma";

export const ROLE_DASHBOARDS: Record<Role, string> = {
  ADMIN: "/admin",
  STUDENT: "/student",
  LECTURER: "/lecturer",
  HOD: "/hod",
  QA_OFFICER: "/qa",
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  STUDENT: "Student",
  LECTURER: "Lecturer",
  HOD: "Head of Department",
  QA_OFFICER: "QA Officer",
};

export const PROTECTED_ROUTES: Record<string, Role[]> = {
  "/admin": ["ADMIN"],
  "/student": ["STUDENT"],
  "/lecturer": ["LECTURER"],
  "/hod": ["HOD"],
  "/qa": ["QA_OFFICER"],
};

export function getDashboardForRole(role: Role): string {
  return ROLE_DASHBOARDS[role] ?? "/login";
}