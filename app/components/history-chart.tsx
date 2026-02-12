"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="card-base rounded-lg px-2.5 py-1.5 text-[11px] shadow-xl">
      <p className="mb-1 text-muted">{label}</p>
      {payload.map((entry: { dataKey: string; value: number; color: string }) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
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
  const [isOpen, setIsOpen] = useState(false);

  const timeMap = new Map<string, Record<string, number>>();

  for (const [machineId, machineData] of Object.entries(machines)) {
    for (const entry of machineData.history) {
      const timeKey = new Date(entry.ts * 1000).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      const existing = timeMap.get(timeKey) || { ts: entry.ts };
      if (entry.system.cpu_temp > 0) {
        existing[machineId] = entry.system.cpu_temp;
      }
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

  // Show ~6 evenly spaced ticks max
  const tickInterval = data.length > 6 ? Math.ceil(data.length / 6) : 0;

  return (
    <section>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mx-auto flex w-full max-w-lg items-center justify-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.03] cursor-pointer"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary">
          CPU Temperature History
        </h2>
        <span className="text-[11px] text-muted">24h</span>
        <svg
          className={`ml-1 h-3 w-3 text-muted/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="pt-2.5">
              {data.length === 0 ? (
                <div className="card-base card-glow-top rounded-xl px-4 py-3">
                  <div className="flex h-36 items-center justify-center text-xs text-muted/60">
                    Collecting data...
                  </div>
                </div>
              ) : (
                <div className="card-base card-glow-top rounded-xl px-4 py-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        {activeMachines.map((id) => (
                          <linearGradient key={id} id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLORS[id]?.fill ?? "#888"} stopOpacity={0.15} />
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
                        tick={{ fill: "#63636e", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        interval={tickInterval}
                      />
                      <YAxis
                        domain={[20, 85]}
                        tick={{ fill: "#63636e", fontSize: 10 }}
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
                          strokeWidth={1.5}
                          fill={`url(#gradient-${id})`}
                          dot={false}
                          connectNulls
                          activeDot={{ r: 3, strokeWidth: 0, fill: CHART_COLORS[id]?.stroke ?? "#888" }}
                        />
                      ))}
                      <Legend
                        formatter={(value: string) =>
                          MACHINE_META[value as MachineId]?.label ?? value
                        }
                        wrapperStyle={{ fontSize: "11px" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
