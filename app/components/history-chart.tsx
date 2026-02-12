"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { MACHINE_META } from "@/lib/types";
import type { MachineData, MachineId } from "@/lib/types";

interface HistoryChartProps {
  machines: Record<string, MachineData>;
}

const CHART_COLORS: Record<string, { stroke: string; fill: string }> = {
  clawpiscout: { stroke: "#34d399", fill: "#34d399" },
  clawpi: { stroke: "#22d3ee", fill: "#22d3ee" },
  macmini: { stroke: "#a78bfa", fill: "#a78bfa" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-base rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="mb-1.5 text-muted">{label}</p>
      {payload.map((entry: { dataKey: string; value: number; color: string }) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-secondary">
            {MACHINE_META[entry.dataKey as MachineId]?.label ?? entry.dataKey}
          </span>
          <span className="ml-auto font-mono font-medium text-foreground">
            {typeof entry.value === "number" ? `${entry.value.toFixed(1)}\u00B0C` : "--"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HistoryChart({ machines }: HistoryChartProps) {
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
      <div className="card-base card-glow-top rounded-2xl p-5">
        <div className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted">
          CPU Temperature History (24h)
        </div>
        <div className="flex h-48 items-center justify-center text-sm text-muted/60">
          Collecting data...
        </div>
      </div>
    );
  }

  return (
    <div className="card-base card-glow-top rounded-2xl p-5">
      <div className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted">
        CPU Temperature History (24h)
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            {activeMachines.map((id) => (
              <linearGradient key={id} id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS[id]?.fill ?? "#888"} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART_COLORS[id]?.fill ?? "#888"} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.03)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "#63636e", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[20, 85]}
            tick={{ fill: "#63636e", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}\u00B0`}
          />
          <Tooltip content={<CustomTooltip />} />
          {activeMachines.map((id) => (
            <Area
              key={id}
              type="monotone"
              dataKey={id}
              stroke={CHART_COLORS[id]?.stroke ?? "#888"}
              strokeWidth={2}
              fill={`url(#gradient-${id})`}
              dot={false}
              connectNulls
              activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS[id]?.stroke ?? "#888" }}
            />
          ))}
          <Legend
            formatter={(value: string) =>
              MACHINE_META[value as MachineId]?.label ?? value
            }
            wrapperStyle={{ fontSize: "12px" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
