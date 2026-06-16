"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

async function getHodDeptId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const hod = await prisma.hod.findUnique({
    where: { userId: session.user.id },
    include: { department: true },
  });
  if (!hod) throw new Error("HOD profile not found");
  return hod;
}

export async function getHODDashboard() {
  const hod = await getHodDeptId();
  const deptId = hod.departmentId;

  const activePeriod = await prisma.evaluationPeriod.findFirst({ where: { status: "ACTIVE" } });
  const latestPeriod = await prisma.evaluationPeriod.findFirst({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
  });

  const [lecturerCount, courseCount] = await Promise.all([
    prisma.lecturer.count({ where: { departmentId: deptId } }),
    prisma.course.count({ where: { departmentId: deptId } }),
  ]);

  let avgScore = 0;
  let responseRate = 0;

  if (latestPeriod) {
    const subs = await prisma.evaluationSubmission.findMany({
      where: { evaluationPeriodId: latestPeriod.id, course: { departmentId: deptId } },
      select: { id: true },
    });
    if (subs.length > 0) {
      const agg = await prisma.evaluationResponse.aggregate({
        where: { submissionId: { in: subs.map((s) => s.id) } },
        _avg: { score: true },
      });
      avgScore = agg._avg.score ?? 0;
    }

    const enrolled = await prisma.courseEnrollment.count({
      where: {
        course: {
          departmentId: deptId,
          periodCourses: { some: { evaluationPeriodId: latestPeriod.id } },
        },
      },
    });
    responseRate = enrolled > 0 ? Math.round((subs.length / enrolled) * 100) : 0;
  }

  return {
    department: hod.department,
    lecturerCount,
    courseCount,
    avgScore,
    responseRate,
    activePeriod,
    latestPeriod,
  };
}

export async function getDeptLecturerScores(periodId?: string) {
  const hod = await getHodDeptId();
  const deptId = hod.departmentId;

  const resolvedPeriodId = periodId ?? (await prisma.evaluationPeriod.findFirst({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  }))?.id;

  const lecturers = await prisma.lecturer.findMany({
    where: { departmentId: deptId },
    include: {
      user: true,
      courses: { include: { _count: { select: { enrollments: true } } } },
    },
  });

  return Promise.all(
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
}

export async function getDeptCourseScores(periodId?: string) {
  const hod = await getHodDeptId();
  const deptId = hod.departmentId;

  const resolvedPeriodId = periodId ?? (await prisma.evaluationPeriod.findFirst({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  }))?.id;

  const courses = await prisma.course.findMany({
    where: { departmentId: deptId },
    include: { lecturer: { include: { user: true } }, _count: { select: { enrollments: true } } },
  });

  return Promise.all(
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
}

export async function getDeptTrend() {
  const hod = await getHodDeptId();
  const deptId = hod.departmentId;
  const periods = await prisma.evaluationPeriod.findMany({
    where: { status: "CLOSED" },
    orderBy: { startDate: "asc" },
  });
  return Promise.all(
    periods.map(async (p) => {
      const subs = await prisma.evaluationSubmission.findMany({
        where: { evaluationPeriodId: p.id, course: { departmentId: deptId } },
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
      return { period: p, avgScore };
    })
  );
}

export async function getEvaluationPeriodsList() {
  return prisma.evaluationPeriod.findMany({
    where: { status: { in: ["ACTIVE", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
  });
}
