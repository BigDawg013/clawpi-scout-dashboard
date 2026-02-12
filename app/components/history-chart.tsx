"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MACHINE_META } from "@/lib/types";
import type { MachineData, MachineId } from "@/lib/types";

interface HistoryChartProps {
  machines: Record<string, MachineData>;
}

const COLORS: Record<string, string> = {
  clawpiscout: "#22c55e",
  clawpi: "#06b6d4",
  macmini: "#a855f7",
};

export function HistoryChart({ machines }: HistoryChartProps) {
  // Merge all machine histories into a unified timeline
  const timeMap = new Map<string, Record<string, number>>();

  for (const [machineId, machineData] of Object.entries(machines)) {
    for (const entry of machineData.history) {
      const timeKey = new Date(entry.ts * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const existing = timeMap.get(timeKey) || { ts: entry.ts };
      existing[machineId] = entry.system.cpu_temp;
      existing.ts = Math.max(existing.ts as number, entry.ts);
      timeMap.set(timeKey, existing);
    }
  }

  const data = Array.from(timeMap.entries())
    .sort((a, b) => (a[1].ts as number) - (b[1].ts as number))
    .map(([time, values]) => ({ time, ...values }));

  const activeMachines = Object.keys(machines).filter(
    (id) => machines[id].history.length > 0
  );

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          CPU Temperature History (24h)
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
        CPU Temperature History (24h)
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="time"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[20, 85]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}°`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #262626",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fafafa",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              typeof value === "number" ? `${value.toFixed(1)}°C` : "--",
              MACHINE_META[name as MachineId]?.label ?? name,
            ]}
          />
          <Legend
            formatter={(value: string) =>
              MACHINE_META[value as MachineId]?.label ?? value
            }
            wrapperStyle={{ fontSize: "12px" }}
          />
          {activeMachines.map((id) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={COLORS[id] || "#888"}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
