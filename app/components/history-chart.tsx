"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ScoutPayload } from "@/lib/types";

interface HistoryChartProps {
  history: ScoutPayload[];
}

export function HistoryChart({ history }: HistoryChartProps) {
  const data = history.map((entry) => ({
    time: new Date(entry.ts * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    health: entry.dashboard.health_score,
    temp: entry.system.cpu_temp,
  }));

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Health History (24h)
        </div>
        <div className="flex h-40 items-center justify-center text-sm text-muted">
          Collecting data...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
        Health History (24h)
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="health"
            domain={[0, 10]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="temp"
            orientation="right"
            domain={[20, 85]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            hide
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #262626",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fafafa",
            }}
          />
          <Area
            yAxisId="health"
            type="monotone"
            dataKey="health"
            stroke="#22c55e"
            fill="url(#healthGrad)"
            strokeWidth={2}
            name="Health"
          />
          <Area
            yAxisId="temp"
            type="monotone"
            dataKey="temp"
            stroke="#06b6d4"
            fill="url(#tempGrad)"
            strokeWidth={1.5}
            name="CPU Temp"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Health Score
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-500" /> CPU Temp
        </span>
      </div>
    </div>
  );
}
