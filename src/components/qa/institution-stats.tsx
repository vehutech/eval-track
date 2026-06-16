"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import { formatScore } from "@/src/lib/utils";

type Dept = { id: string; name: string; avgScore: number | null };
type TrendPoint = { period: { title: string }; avgScore: number; submissionCount: number };

interface QAAnalyticsChartsProps {
  depts: Dept[];
  trend: TrendPoint[];
}

export function QAAnalyticsCharts({ depts, trend }: QAAnalyticsChartsProps) {
  const deptData = depts
    .filter((d) => d.avgScore != null)
    .map((d) => ({ name: d.name.split(" ").slice(0, 2).join(" "), avg: Number(formatScore(d.avgScore!)) }))
    .sort((a, b) => b.avg - a.avg);

  const trendData = trend.map((t) => ({
    period: t.period.title,
    avg: Number(formatScore(t.avgScore)),
    submissions: t.submissionCount,
  }));

  return (
    <div className="flex flex-col gap-6">
      {trendData.length > 0 && (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <p className="text-sm font-semibold mb-4">Institution Average Score Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(var(--foreground-muted))" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--foreground-muted))" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 12 }}
                formatter={(v: number) => [v.toFixed(2), "Avg Score"]}
              />
              <Legend />
              <Line type="monotone" dataKey="avg" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} name="Institution Avg" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {deptData.length > 0 && (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <p className="text-sm font-semibold mb-4">Department Comparison</p>
          <ResponsiveContainer width="100%" height={Math.max(200, deptData.length * 40)}>
            <BarChart data={deptData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--foreground-muted))" }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "hsl(var(--foreground-muted))" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 12 }}
                formatter={(v: number) => [v.toFixed(2), "Avg Score"]}
              />
              <Bar dataKey="avg" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {trendData.length === 0 && deptData.length === 0 && (
        <p className="text-sm text-[hsl(var(--foreground-muted))]">No evaluation data available yet.</p>
      )}
    </div>
  );
}
