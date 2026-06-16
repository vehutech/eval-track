import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-[hsl(var(--foreground-muted))]">Institution configuration</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Institution</CardTitle>
          <CardDescription>General settings for your institution</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">Settings management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
