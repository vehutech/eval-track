"use server";

import { prisma } from "@/src/lib/prisma";
import { periodSchema } from "@/src/lib/validations/admin";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function getEvaluationPeriods() {
  return prisma.evaluationPeriod.findMany({
    include: {
      periodCourses: { include: { course: { include: { lecturer: { include: { user: true } }, department: true } } } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPeriod(data: unknown) {
  await requireAdmin();
  const parsed = periodSchema.parse(data);
  const period = await prisma.evaluationPeriod.create({
    data: {
      title: parsed.title,
      academicYear: parsed.academicYear,
      semester: parsed.semester,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      periodCourses: {
        create: parsed.courseIds.map((courseId) => ({ courseId })),
      },
    },
  });
  revalidatePath("/admin/periods");
  return period;
}

export async function activatePeriod(id: string) {
  await requireAdmin();
  const existing = await prisma.evaluationPeriod.findFirst({ where: { status: "ACTIVE" } });
  if (existing && existing.id !== id) {
    throw new Error("Another period is already active. Close it before activating a new one.");
  }
  const period = await prisma.evaluationPeriod.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
  revalidatePath("/admin/periods");
  return period;
}

export async function closePeriod(id: string) {
  await requireAdmin();
  const period = await prisma.evaluationPeriod.update({
    where: { id },
    data: { status: "CLOSED" },
  });
  revalidatePath("/admin/periods");
  return period;
}

export async function deletePeriod(id: string) {
  await requireAdmin();
  const period = await prisma.evaluationPeriod.findUnique({
    where: { id },
    include: { _count: { select: { submissions: true } } },
  });
  if (!period) throw new Error("Period not found");
  if (period.status !== "DRAFT") throw new Error("Only DRAFT periods can be deleted");
  if (period._count.submissions > 0) throw new Error("Cannot delete period with submissions");
  await prisma.evaluationPeriod.delete({ where: { id } });
  revalidatePath("/admin/periods");
}
