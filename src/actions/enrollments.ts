"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function getStudentsForEnrollment(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { departmentId: true, level: true },
  });
  if (!course) throw new Error("Course not found");

  const enrolled = await prisma.courseEnrollment.findMany({
    where: { courseId },
    select: { studentId: true },
  });
  const enrolledIds = enrolled.map((e) => e.studentId);

  const allStudents = await prisma.student.findMany({
    where: {
      departmentId: course.departmentId,
      level: course.level,
      id: { notIn: enrolledIds },
    },
    include: { user: true },
  });

  return allStudents;
}

export async function bulkEnroll(courseId: string, studentIds: string[]) {
  await requireAdmin();
  await prisma.courseEnrollment.createMany({
    data: studentIds.map((studentId) => ({ courseId, studentId })),
    skipDuplicates: true,
  });
  revalidatePath(`/admin/courses/${courseId}/enroll`);
}
