import { cn } from "@/src/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius)] bg-[hsl(var(--background-subtle))]", className)}
      {...props}
    />
  );
}
