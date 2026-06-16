"use server";

import { prisma } from "@/src/lib/prisma";
import { courseSchema } from "@/src/lib/validations/admin";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function getCourses(search?: string, departmentId?: string) {
  return prisma.course.findMany({
    where: {
      ...(search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
      ...(departmentId ? { departmentId } : {}),
    },
    include: {
      department: true,
      lecturer: { include: { user: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { code: "asc" },
  });
}

export async function createCourse(data: unknown) {
  await requireAdmin();
  const parsed = courseSchema.parse(data);
  const course = await prisma.course.create({ data: parsed });
  revalidatePath("/admin/courses");
  return course;
}

export async function updateCourse(id: string, data: unknown) {
  await requireAdmin();
  const parsed = courseSchema.parse(data);
  const course = await prisma.course.update({ where: { id }, data: parsed });
  revalidatePath("/admin/courses");
  return course;
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  const course = await prisma.course.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: true } } },
  });
  if (!course) throw new Error("Course not found");
  if (course._count.enrollments > 0) {
    throw new Error("Cannot delete course with enrolled students");
  }
  await prisma.course.delete({ where: { id } });
  revalidatePath("/admin/courses");
}

export async function getCourseEnrollments(courseId: string) {
  return prisma.courseEnrollment.findMany({
    where: { courseId },
    include: { student: { include: { user: true } } },
  });
}

export async function addEnrollment(courseId: string, studentId: string) {
  await requireAdmin();
  const existing = await prisma.courseEnrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (existing) throw new Error("Student already enrolled");
  const enrollment = await prisma.courseEnrollment.create({
    data: { courseId, studentId },
  });
  revalidatePath(`/admin/courses/${courseId}/enroll`);
  return enrollment;
}

export async function removeEnrollment(courseId: string, studentId: string) {
  await requireAdmin();
  await prisma.courseEnrollment.delete({
    where: { studentId_courseId: { studentId, courseId } },
  });
  revalidatePath(`/admin/courses/${courseId}/enroll`);
}

export async function getLecturersByDept(departmentId: string) {
  return prisma.lecturer.findMany({
    where: { departmentId },
    include: { user: true },
  });
}
