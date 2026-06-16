import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, description, icon, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-[hsl(var(--foreground-muted))]">
            {title}
          </CardTitle>
          {icon && <div className="text-[hsl(var(--foreground-subtle))]">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-[hsl(var(--foreground))]">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
