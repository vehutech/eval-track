"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const submitSchema = z.object({
  courseId: z.string(),
  periodId: z.string(),
  responses: z.array(z.object({ questionId: z.string(), score: z.number().int().min(1).max(5) })),
});

export async function getActiveEvaluationPeriod() {
  return prisma.evaluationPeriod.findFirst({
    where: { status: "ACTIVE" },
    include: {
      periodCourses: { select: { courseId: true } },
    },
  });
}

export async function getStudentCourses() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              department: true,
              lecturer: { include: { user: true } },
            },
          },
        },
      },
    },
  });
  if (!student) throw new Error("Student profile not found");
  return student.enrollments.map((e) => e.course);
}

export async function getPendingEvaluations() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [student, activePeriod] = await Promise.all([
    prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        enrollments: {
          include: {
            course: { include: { lecturer: { include: { user: true } }, department: true } },
          },
        },
      },
    }),
    prisma.evaluationPeriod.findFirst({ where: { status: "ACTIVE" } }),
  ]);

  if (!student || !activePeriod) return { period: null, courses: [] };

  const periodCourseIds = await prisma.evaluationPeriodCourse.findMany({
    where: { evaluationPeriodId: activePeriod.id },
    select: { courseId: true },
  });
  const periodCourseSet = new Set(periodCourseIds.map((pc) => pc.courseId));

  const submittedCourseIds = new Set(
    (await prisma.evaluationSubmission.findMany({
      where: { studentId: student.id, evaluationPeriodId: activePeriod.id },
      select: { courseId: true },
    })).map((s) => s.courseId)
  );

  const eligible = student.enrollments
    .filter((e) => periodCourseSet.has(e.courseId))
    .map((e) => ({ ...e.course, submitted: submittedCourseIds.has(e.courseId) }));

  return { period: activePeriod, courses: eligible };
}

export async function getEvaluationFormData(courseId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [student, activePeriod, questions] = await Promise.all([
    prisma.student.findUnique({ where: { userId: session.user.id } }),
    prisma.evaluationPeriod.findFirst({ where: { status: "ACTIVE" } }),
    prisma.evaluationQuestion.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!student) throw new Error("Student profile not found");
  if (!activePeriod) throw new Error("No active evaluation period");

  const enrolled = await prisma.courseEnrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId } },
  });
  if (!enrolled) throw new Error("Not enrolled in this course");

  const inPeriod = await prisma.evaluationPeriodCourse.findUnique({
    where: { evaluationPeriodId_courseId: { evaluationPeriodId: activePeriod.id, courseId } },
  });
  if (!inPeriod) throw new Error("Course not in active period");

  const alreadySubmitted = await prisma.evaluationSubmission.findUnique({
    where: {
      studentId_evaluationPeriodId_courseId: {
        studentId: student.id,
        evaluationPeriodId: activePeriod.id,
        courseId,
      },
    },
  });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lecturer: { include: { user: true } }, department: true },
  });

  return { student, period: activePeriod, questions, course, alreadySubmitted: !!alreadySubmitted };
}

export async function submitEvaluation(data: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const parsed = submitSchema.parse(data);

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) throw new Error("Student profile not found");

  const existing = await prisma.evaluationSubmission.findUnique({
    where: {
      studentId_evaluationPeriodId_courseId: {
        studentId: student.id,
        evaluationPeriodId: parsed.periodId,
        courseId: parsed.courseId,
      },
    },
  });
  if (existing) throw new Error("You have already submitted an evaluation for this course");

  await prisma.$transaction([
    prisma.evaluationSubmission.create({
      data: {
        studentId: student.id,
        evaluationPeriodId: parsed.periodId,
        courseId: parsed.courseId,
        responses: {
          create: parsed.responses.map((r) => ({
            questionId: r.questionId,
            score: r.score,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/student/evaluate");
  revalidatePath("/student/history");
}

export async function getSubmissionHistory() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) return [];
  return prisma.evaluationSubmission.findMany({
    where: { studentId: student.id },
    include: {
      period: true,
      course: { include: { lecturer: { include: { user: true } } } },
    },
    orderBy: { submittedAt: "desc" },
  });
}
