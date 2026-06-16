import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/src/actions/users";
import { getDepartments } from "@/src/actions/departments";
import { UsersClient } from "@/src/components/admin/users-client";

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  const [users, departments] = await Promise.all([getUsers(), getDepartments()]);
  return <UsersClient users={users} departments={departments} />;
}
