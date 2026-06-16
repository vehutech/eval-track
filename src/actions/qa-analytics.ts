"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

async function requireQA() {
  const session = await auth();
  if (!["QA_OFFICER", "ADMIN"].includes(session?.user?.role ?? "")) throw new Error("Unauthorized");
}

export async function getQADashboard(periodId?: string) {
  await requireQA();

  const latestPeriod = periodId
    ? await prisma.evaluationPeriod.findUnique({ where: { id: periodId } })
    : await prisma.evaluationPeriod.findFirst({
        where: { status: { in: ["ACTIVE", "CLOSED"] } },
        orderBy: { createdAt: "desc" },
      });

  const [deptCount, lecturerCount, totalSubmissions] = await Promise.all([
    prisma.department.count(),
    prisma.lecturer.count(),
    prisma.evaluationSubmission.count(),
  ]);

  let instAvg = 0;
  let responseRate = 0;

  if (latestPeriod) {
    const subs = await prisma.evaluationSubmission.findMany({
      where: { evaluationPeriodId: latestPeriod.id },
      select: { id: true },
    });
    if (subs.length > 0) {
      const agg = await prisma.evaluationResponse.aggregate({
        where: { submissionId: { in: subs.map((s) => s.id) } },
        _avg: { score: true },
      });
      instAvg = agg._avg.score ?? 0;
    }
    const enrolled = await prisma.courseEnrollment.count({
      where: {
        course: { periodCourses: { some: { evaluationPeriodId: latestPeriod.id } } },
      },
    });
    responseRate = enrolled > 0 ? Math.round((subs.length / enrolled) * 100) : 0;
  }

  return { deptCount, lecturerCount, totalSubmissions, instAvg, responseRate, latestPeriod };
}

export async function getAllDeptScores(periodId?: string) {
  await requireQA();

  const resolvedPeriodId = periodId ?? (await prisma.evaluationPeriod.findFirst({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  }))?.id;

  const depts = await prisma.department.findMany({
    include: {
      _count: { select: { lecturers: true, courses: true } },
    },
  });

  return Promise.all(
    depts.map(async (d) => {
      const where = resolvedPeriodId
        ? { evaluationPeriodId: resolvedPeriodId, course: { departmentId: d.id } }
        : { course: { departmentId: d.id } };
      const subs = await prisma.evaluationSubmission.findMany({ where, select: { id: true } });
      let avgScore: number | null = null;
      if (subs.length > 0) {
        const agg = await prisma.evaluationResponse.aggregate({
          where: { submissionId: { in: subs.map((s) => s.id) } },
          _avg: { score: true },
        });
        avgScore = agg._avg.score;
      }
      const enrolled = resolvedPeriodId ? await prisma.courseEnrollment.count({
        where: { course: { departmentId: d.id, periodCourses: { some: { evaluationPeriodId: resolvedPeriodId } } } },
      }) : 0;
      const responseRate = enrolled > 0 ? Math.round((subs.length / enrolled) * 100) : 0;
      return { ...d, avgScore, responseCount: subs.length, responseRate };
    })
  );
}

export async function getInstitutionTrend() {
  await requireQA();
  const periods = await prisma.evaluationPeriod.findMany({
    where: { status: "CLOSED" },
    orderBy: { startDate: "asc" },
  });
  return Promise.all(
    periods.map(async (p) => {
      const subs = await prisma.evaluationSubmission.findMany({
        where: { evaluationPeriodId: p.id },
        select: { id: true },
      });
      let avgScore = 0;
      if (subs.length > 0) {
        const agg = await prisma.evaluationResponse.aggregate({
          where: { submissionId: { in: subs.map((s) => s.id) } },
          _avg: { score: true },
        });
        avgScore = agg._avg.score ?? 0;
      }
      return { period: p, avgScore, submissionCount: subs.length };
    })
  );
}

export async function getDeptDetail(deptId: string, periodId?: string) {
  await requireQA();

  const dept = await prisma.department.findUnique({
    where: { id: deptId },
    include: { hod: { include: { user: true } } },
  });
  if (!dept) throw new Error("Department not found");

  const resolvedPeriodId = periodId ?? (await prisma.evaluationPeriod.findFirst({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  }))?.id;

  const lecturers = await prisma.lecturer.findMany({
    where: { departmentId: deptId },
    include: { user: true },
  });

  const lecturerScores = await Promise.all(
    lecturers.map(async (l) => {
      const where = resolvedPeriodId
        ? { course: { lecturerId: l.id }, evaluationPeriodId: resolvedPeriodId }
        : { course: { lecturerId: l.id } };
      const subs = await prisma.evaluationSubmission.findMany({ where, select: { id: true } });
      let avgScore: number | null = null;
      if (subs.length > 0) {
        const agg = await prisma.evaluationResponse.aggregate({
          where: { submissionId: { in: subs.map((s) => s.id) } },
          _avg: { score: true },
        });
        avgScore = agg._avg.score;
      }
      return { ...l, avgScore, responseCount: subs.length };
    })
  );

  const courses = await prisma.course.findMany({
    where: { departmentId: deptId },
    include: { lecturer: { include: { user: true } } },
  });

  const courseScores = await Promise.all(
    courses.map(async (c) => {
      const where = resolvedPeriodId
        ? { courseId: c.id, evaluationPeriodId: resolvedPeriodId }
        : { courseId: c.id };
      const subs = await prisma.evaluationSubmission.findMany({ where, select: { id: true } });
      let avgScore: number | null = null;
      if (subs.length > 0) {
        const agg = await prisma.evaluationResponse.aggregate({
          where: { submissionId: { in: subs.map((s) => s.id) } },
          _avg: { score: true },
        });
        avgScore = agg._avg.score;
      }
      return { ...c, avgScore, responseCount: subs.length };
    })
  );

  return { dept, lecturerScores, courseScores };
}

export async function getPeriodsList() {
  return prisma.evaluationPeriod.findMany({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
  });
}
