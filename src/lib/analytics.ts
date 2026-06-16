import { prisma } from "@/src/lib/prisma";

export async function getActiveEvaluationPeriod() {
  return prisma.evaluationPeriod.findFirst({
    where: { status: "ACTIVE" },
    include: {
      periodCourses: { include: { course: { include: { lecturer: { include: { user: true } }, department: true } } } },
    },
  });
}

export async function computeAvgScore(submissionIds: string[]): Promise<number> {
  if (submissionIds.length === 0) return 0;
  const result = await prisma.evaluationResponse.aggregate({
    where: { submissionId: { in: submissionIds } },
    _avg: { score: true },
  });
  return result._avg.score ?? 0;
}

export async function getLecturerAvgScore(lecturerId: string, periodId?: string) {
  const where = periodId
    ? { course: { lecturerId }, evaluationPeriodId: periodId }
    : { course: { lecturerId } };
  const submissions = await prisma.evaluationSubmission.findMany({
    where,
    select: { id: true },
  });
  return computeAvgScore(submissions.map((s) => s.id));
}

export async function getDeptAvgScore(deptId: string, periodId?: string) {
  const where = periodId
    ? { course: { departmentId: deptId }, evaluationPeriodId: periodId }
    : { course: { departmentId: deptId } };
  const submissions = await prisma.evaluationSubmission.findMany({
    where,
    select: { id: true },
  });
  return computeAvgScore(submissions.map((s) => s.id));
}

export async function getInstitutionAvgScore(periodId?: string) {
  const where = periodId ? { evaluationPeriodId: periodId } : {};
  const submissions = await prisma.evaluationSubmission.findMany({
    where,
    select: { id: true },
  });
  return computeAvgScore(submissions.map((s) => s.id));
}

export async function getResponseRate(
  enrolled: number,
  submitted: number
): Promise<number> {
  if (enrolled === 0) return 0;
  return Math.round((submitted / enrolled) * 100);
}
