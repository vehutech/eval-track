import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getCourseEnrollments } from "@/src/actions/courses";
import { getStudentsForEnrollment } from "@/src/actions/enrollments";
import { prisma } from "@/src/lib/prisma";
import { EnrollmentsClient } from "@/src/components/admin/enrollments-client";

export default async function CourseEnrollPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  const { id } = await params;
  const [course, enrollments, available] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: { department: true, lecturer: { include: { user: true } } },
    }),
    getCourseEnrollments(id),
    getStudentsForEnrollment(id),
  ]);
  if (!course) redirect("/admin/courses");
  return <EnrollmentsClient course={course} enrollments={enrollments} available={available} />;
}
