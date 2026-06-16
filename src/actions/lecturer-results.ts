"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

async function getLecturerId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const lecturer = await prisma.lecturer.findUnique({ where: { userId: session.user.id } });
  if (!lecturer) throw new Error("Lecturer profile not found");
  return lecturer.id;
}

export async function getLecturerDashboardStats() {
  const lecturerId = await getLecturerId();
  const [courseCount, totalResponses, latestPeriod] = await Promise.all([
    prisma.course.count({ where: { lecturerId } }),
    prisma.evaluationResponse.count({
      where: { submission: { course: { lecturerId } } },
    }),
    prisma.evaluationPeriod.findFirst({
      where: { status: { in: ["ACTIVE", "CLOSED"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let avgScore = 0;
  if (totalResponses > 0) {
    const result = await prisma.evaluationResponse.aggregate({
      where: { submission: { course: { lecturerId } } },
      _avg: { score: true },
    });
    avgScore = result._avg.score ?? 0;
  }

  return { courseCount, totalResponses, avgScore, latestPeriod };
}

export async function getLecturerCourses() {
  const lecturerId = await getLecturerId();
  const courses = await prisma.course.findMany({
    where: { lecturerId },
    include: {
      department: true,
      _count: { select: { enrollments: true, submissions: true } },
    },
    orderBy: { code: "asc" },
  });

  const latestPeriod = await prisma.evaluationPeriod.findFirst({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
  });

  const results = await Promise.all(
    courses.map(async (c) => {
      if (!latestPeriod) return { ...c, avgScore: null };
      const subs = await prisma.evaluationSubmission.findMany({
        where: { courseId: c.id, evaluationPeriodId: latestPeriod.id },
        select: { id: true },
      });
      if (subs.length === 0) return { ...c, avgScore: null };
      const agg = await prisma.evaluationResponse.aggregate({
        where: { submissionId: { in: subs.map((s) => s.id) } },
        _avg: { score: true },
      });
      return { ...c, avgScore: agg._avg.score };
    })
  );

  return results;
}

export async function getLecturerEvaluationPeriods() {
  const lecturerId = await getLecturerId();
  const periods = await prisma.evaluationPeriod.findMany({
    where: {
      submissions: { some: { course: { lecturerId } } },
    },
    include: {
      periodCourses: {
        include: {
          course: {
            include: { _count: { select: { submissions: true } } },
          },
        },
        where: { course: { lecturerId } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const withScores = await Promise.all(
    periods.map(async (p) => {
      const subs = await prisma.evaluationSubmission.findMany({
        where: { evaluationPeriodId: p.id, course: { lecturerId } },
        select: { id: true },
      });
      let avgScore: number | null = null;
      if (subs.length > 0) {
        const agg = await prisma.evaluationResponse.aggregate({
          where: { submissionId: { in: subs.map((s) => s.id) } },
          _avg: { score: true },
        });
        avgScore = agg._avg.score;
      }
      return { ...p, submissionCount: subs.length, avgScore };
    })
  );

  return withScores;
}

export async function getLecturerCourseResult(periodId: string, courseId: string) {
  const lecturerId = await getLecturerId();
  const course = await prisma.course.findFirst({
    where: { id: courseId, lecturerId },
    include: { department: true, lecturer: { include: { user: true } } },
  });
  if (!course) throw new Error("Course not found");

  const period = await prisma.evaluationPeriod.findUnique({ where: { id: periodId } });
  if (!period) throw new Error("Period not found");

  const submissions = await prisma.evaluationSubmission.findMany({
    where: { courseId, evaluationPeriodId: periodId },
    include: {
      responses: { include: { question: true } },
    },
  });

  const allResponses = submissions.flatMap((s) => s.responses);
  const overall = allResponses.length > 0
    ? allResponses.reduce((sum, r) => sum + r.score, 0) / allResponses.length
    : 0;

  const byQuestion: Record<string, { question: typeof allResponses[0]["question"]; scores: number[] }> = {};
  for (const r of allResponses) {
    if (!byQuestion[r.questionId]) byQuestion[r.questionId] = { question: r.question, scores: [] };
    byQuestion[r.questionId].scores.push(r.score);
  }

  const questionBreakdown = Object.values(byQuestion).map(({ question, scores }) => ({
    question,
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    count: scores.length,
  })).sort((a, b) => a.question.order - b.question.order);

  const byCategory: Record<string, number[]> = {};
  for (const { question, avg } of questionBreakdown) {
    if (!byCategory[question.category]) byCategory[question.category] = [];
    byCategory[question.category].push(avg);
  }
  const categoryBreakdown = Object.entries(byCategory).map(([category, avgs]) => ({
    category,
    avg: avgs.reduce((a, b) => a + b, 0) / avgs.length,
  }));

  return { course, period, submissionCount: submissions.length, overall, questionBreakdown, categoryBreakdown };
}
