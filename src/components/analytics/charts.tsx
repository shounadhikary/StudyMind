"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  AccuracyPoint,
  DaySeriesPoint,
  SubjectSlice,
} from "@/lib/analytics/queries";

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  fontSize: "12px",
  color: "var(--color-popover-foreground)",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
} as const;

const axisProps = {
  tick: { fontSize: 11, fill: "var(--color-muted-foreground)" },
  tickLine: false,
  axisLine: { stroke: "var(--color-border)" },
} as const;

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

export function StudyTimeChart({ data }: { data: DaySeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={32} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          formatter={(value) => [`${value} min`, "Study time"]}
        />
        <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CardsChart({ data }: { data: DaySeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis dataKey="date" {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={32} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          formatter={(value) => [`${value}`, "Cards"]}
        />
        <Bar dataKey="value" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AccuracyChart({ data }: { data: AccuracyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={32} domain={[0, 100]} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [`${value}%`, "Score"]}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-primary)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SubjectChart({ data }: { data: SubjectSlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="minutes"
          nameKey="subject"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          stroke="var(--color-background)"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => [`${value} min`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
