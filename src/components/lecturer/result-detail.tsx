"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface CategoryData {
  category: string;
  avg: number;
}

export function ResultChart({ data }: { data: CategoryData[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-[hsl(var(--foreground-muted))]">No data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
        <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--foreground-muted))" }} />
        <YAxis type="category" dataKey="category" width={80} tick={{ fontSize: 11, fill: "hsl(var(--foreground-muted))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--surface))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            fontSize: 12,
          }}
          formatter={(value: number) => [value.toFixed(2), "Avg Score"]}
        />
        <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill="hsl(var(--accent))" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
