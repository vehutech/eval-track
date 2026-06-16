import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getEvaluationPeriods } from "@/src/actions/periods";
import { getCourses } from "@/src/actions/courses";
import { PeriodsClient } from "@/src/components/admin/periods-client";

export default async function PeriodsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  const [periods, courses] = await Promise.all([getEvaluationPeriods(), getCourses()]);
  return <PeriodsClient periods={periods} courses={courses} />;
}
