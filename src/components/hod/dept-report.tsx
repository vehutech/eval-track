"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { formatScore } from "@/src/lib/utils";

type Lecturer = { id: string; user: { name: string }; avgScore: number | null; responseCount: number };
type TrendPoint = { period: { title: string }; avgScore: number };

interface HODReportChartsProps {
  lecturers: Lecturer[];
  trend: TrendPoint[];
}

export function HODReportCharts({ lecturers, trend }: HODReportChartsProps) {
  const lecturerChartData = lecturers
    .filter((l) => l.avgScore != null)
    .map((l) => ({ name: l.user.name.split(" ")[0], avg: Number(formatScore(l.avgScore!)) }))
    .sort((a, b) => b.avg - a.avg);

  const trendData = trend.map((t) => ({
    period: t.period.title,
    avg: Number(formatScore(t.avgScore)),
  }));

  return (
    <div className="flex flex-col gap-6">
      {lecturerChartData.length > 0 && (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <p className="text-sm font-semibold mb-4">Lecturer Comparison (Latest Period)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={lecturerChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--foreground-muted))" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--foreground-muted))" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 12 }}
                formatter={(v: number) => [v.toFixed(2), "Avg Score"]}
              />
              <Bar dataKey="avg" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {trendData.length > 0 && (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
          <p className="text-sm font-semibold mb-4">Department Score Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(var(--foreground-muted))" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--foreground-muted))" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 12 }}
                formatter={(v: number) => [v.toFixed(2), "Avg Score"]}
              />
              <Legend />
              <Line type="monotone" dataKey="avg" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} name="Dept Avg" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {lecturerChartData.length === 0 && trendData.length === 0 && (
        <p className="text-sm text-[hsl(var(--foreground-muted))]">No evaluation data available yet.</p>
      )}
    </div>
  );
}
