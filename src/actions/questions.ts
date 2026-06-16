"use server";

import { prisma } from "@/src/lib/prisma";
import { questionSchema } from "@/src/lib/validations/admin";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function getQuestions() {
  return prisma.evaluationQuestion.findMany({ orderBy: { order: "asc" } });
}

export async function createQuestion(data: unknown) {
  await requireAdmin();
  const parsed = questionSchema.parse(data);
  const q = await prisma.evaluationQuestion.create({ data: parsed });
  revalidatePath("/admin/questions");
  return q;
}

export async function updateQuestion(id: string, data: unknown) {
  await requireAdmin();
  const parsed = questionSchema.parse(data);
  const q = await prisma.evaluationQuestion.update({ where: { id }, data: parsed });
  revalidatePath("/admin/questions");
  return q;
}

export async function deleteQuestion(id: string) {
  await requireAdmin();
  await prisma.evaluationQuestion.delete({ where: { id } });
  revalidatePath("/admin/questions");
}
