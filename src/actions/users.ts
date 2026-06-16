"use server";

import { prisma } from "@/src/lib/prisma";
import { createUserSchema, updateUserSchema, resetPasswordSchema } from "@/src/lib/validations/admin";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function getUsers(search?: string, role?: string) {
  return prisma.user.findMany({
    where: {
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
      ...(role ? { role: role as never } : {}),
    },
    include: {
      lecturer: { include: { department: true } },
      student: { include: { department: true } },
      hod: { include: { department: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createUser(data: unknown) {
  const session = await requireAdmin();
  const parsed = createUserSchema.parse(data);

  if (parsed.role === "HOD" && parsed.departmentId) {
    const existing = await prisma.hod.findUnique({
      where: { departmentId: parsed.departmentId },
    });
    if (existing) throw new Error("This department already has an HOD");
  }

  const hashed = await bcrypt.hash(parsed.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      password: hashed,
      role: parsed.role as never,
      staffId: parsed.staffId,
      studentId: parsed.studentId,
      ...(parsed.role === "LECTURER" && parsed.departmentId
        ? { lecturer: { create: { departmentId: parsed.departmentId } } }
        : {}),
      ...(parsed.role === "STUDENT" && parsed.departmentId && parsed.level
        ? { student: { create: { departmentId: parsed.departmentId, level: parsed.level } } }
        : {}),
      ...(parsed.role === "HOD" && parsed.departmentId
        ? { hod: { create: { departmentId: parsed.departmentId } } }
        : {}),
      ...(parsed.role === "QA_OFFICER" ? { qaOfficer: { create: {} } } : {}),
      ...(parsed.role === "ADMIN" ? { admin: { create: {} } } : {}),
    },
  });
  revalidatePath("/admin/users");
  void session;
  return user;
}

export async function deleteUser(id: string) {
  const session = await requireAdmin();
  if (session.user.id === id) throw new Error("You cannot delete your own account");
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

export async function resetUserPassword(data: unknown) {
  await requireAdmin();
  const parsed = resetPasswordSchema.parse(data);
  const hashed = await bcrypt.hash(parsed.newPassword, 12);
  await prisma.user.update({
    where: { id: parsed.userId },
    data: { password: hashed },
  });
}
