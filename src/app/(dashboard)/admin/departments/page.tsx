import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getDepartments } from "@/src/actions/departments";
import { DepartmentsClient } from "@/src/components/admin/departments-client";

export default async function DepartmentsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  const departments = await getDepartments();
  return <DepartmentsClient departments={departments} />;
}
