import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--surface))] px-3 py-1 text-sm text-[hsl(var(--foreground))] shadow-sm transition-colors",
            "placeholder:text-[hsl(var(--foreground-subtle))]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[hsl(var(--destructive))]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };