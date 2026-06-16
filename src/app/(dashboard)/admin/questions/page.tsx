import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getQuestions } from "@/src/actions/questions";
import { QuestionsClient } from "@/src/components/admin/questions-client";

export default async function QuestionsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  const questions = await getQuestions();
  return <QuestionsClient questions={questions} />;
}
