import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getEvaluationFormData } from "@/src/actions/evaluations";
import { EvaluationForm } from "@/src/components/student/evaluation-form";
import { Badge } from "@/src/components/ui/badge";

export default async function EvaluationFormPage({ params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "STUDENT") redirect("/");
  const { courseId } = await params;

  let data;
  try {
    data = await getEvaluationFormData(courseId);
  } catch {
    redirect("/student/evaluate");
  }

  if (data.alreadySubmitted) redirect("/student/evaluate");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Course Evaluation</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline">{data.course?.code}</Badge>
          <span className="text-sm text-[hsl(var(--foreground-muted))]">{data.course?.title}</span>
        </div>
        <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
          Lecturer: {data.course?.lecturer.user.name} · Period: {data.period.title}
        </p>
      </div>
      <EvaluationForm
        questions={data.questions}
        courseId={courseId}
        periodId={data.period.id}
      />
    </div>
  );
}
