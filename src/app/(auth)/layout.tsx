export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-semibold text-[hsl(var(--foreground))]">EvalTrack</span>
          </div>
          <p className="text-sm text-[hsl(var(--foreground-muted))]">Teaching Effectiveness Evaluation System</p>
        </div>
        {children}
      </div>
    </div>
  );
}
