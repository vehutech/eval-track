import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getSubmissionHistory } from "@/src/actions/evaluations";
import { Badge } from "@/src/components/ui/badge";
import { EmptyState } from "@/src/components/shared/empty-state";
import { FileText } from "lucide-react";
import { formatDate } from "@/src/lib/utils";

export default async function HistoryPage() {
  const session = await auth();
  if (session?.user?.role !== "STUDENT") redirect("/");
  const history = await getSubmissionHistory();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Submission History</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">{history.length} submissions</p>
      </div>
      {history.length === 0 ? (
        <EmptyState icon={<FileText className="h-5 w-5" />} title="No submissions yet" description="Your completed evaluations will appear here." />
      ) : (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))]">
                {["Period", "Course", "Lecturer", "Submitted"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[hsl(var(--foreground-muted))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background-subtle))]">
                  <td className="px-4 py-3 text-[hsl(var(--foreground))]">{s.period.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{s.course.code}</Badge>
                      <span className="text-[hsl(var(--foreground))]">{s.course.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{s.course.lecturer.user.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground-muted))]">{formatDate(s.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
