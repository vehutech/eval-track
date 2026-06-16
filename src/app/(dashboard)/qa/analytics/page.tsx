import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getAllDeptScores, getInstitutionTrend } from "@/src/actions/qa-analytics";
import { QAAnalyticsCharts } from "@/src/components/qa/institution-stats";

export default async function QAAnalyticsPage() {
  const session = await auth();
  if (session?.user?.role !== "QA_OFFICER") redirect("/");
  const [depts, trend] = await Promise.all([getAllDeptScores(), getInstitutionTrend()]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">Institution-wide trends and comparisons</p>
      </div>
      <QAAnalyticsCharts depts={depts} trend={trend} />
    </div>
  );
}
