import { cn } from "@/src/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center gap-3", className)}>
      {icon && (
        <div className="h-12 w-12 rounded-full bg-[hsl(var(--background-subtle))] flex items-center justify-center text-[hsl(var(--foreground-muted))]">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
