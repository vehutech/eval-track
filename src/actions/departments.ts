"use server";

import { prisma } from "@/src/lib/prisma";
import { departmentSchema } from "@/src/lib/validations/admin";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function getDepartments() {
  return prisma.department.findMany({
    include: {
      _count: { select: { lecturers: true, students: true, courses: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createDepartment(data: unknown) {
  await requireAdmin();
  const parsed = departmentSchema.parse(data);
  const dept = await prisma.department.create({ data: parsed });
  revalidatePath("/admin/departments");
  return dept;
}

export async function updateDepartment(id: string, data: unknown) {
  await requireAdmin();
  const parsed = departmentSchema.parse(data);
  const dept = await prisma.department.update({ where: { id }, data: parsed });
  revalidatePath("/admin/departments");
  return dept;
}

export async function deleteDepartment(id: string) {
  await requireAdmin();
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { lecturers: true, students: true, courses: true } } },
  });
  if (!dept) throw new Error("Department not found");
  if (dept._count.lecturers > 0 || dept._count.students > 0 || dept._count.courses > 0) {
    throw new Error("Cannot delete department with existing members or courses");
  }
  await prisma.department.delete({ where: { id } });
  revalidatePath("/admin/departments");
}
