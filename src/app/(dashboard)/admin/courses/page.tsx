import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getCourses } from "@/src/actions/courses";
import { getDepartments } from "@/src/actions/departments";
import { CoursesClient } from "@/src/components/admin/courses-client";

export default async function CoursesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  const [courses, departments] = await Promise.all([getCourses(), getDepartments()]);
  return <CoursesClient courses={courses} departments={departments} />;
}
