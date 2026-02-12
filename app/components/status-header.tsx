"use client";

import { MACHINE_META } from "@/lib/types";
import type { MachineData, MachineId } from "@/lib/types";

interface StatusHeaderProps {
  machines: Record<string, MachineData>;
  latestTs: number;
  isLoading: boolean;
}

type SystemStatus = "active" | "warning" | "down";

function getSystemStatus(machines: Record<string, MachineData>, latestTs: number, isLoading: boolean): SystemStatus {
  if (isLoading) return "warning";
  const ids = Object.keys(MACHINE_META) as MachineId[];
  const statuses = ids.map((id) => {
    const current = machines[id]?.current;
    if (!current) return "down" as const;
    return (Date.now() / 1000 - current.ts) < 300 ? "active" as const : "down" as const;
  });
  if (statuses.every((s) => s === "down")) return "down";
  if (statuses.some((s) => s === "down")) return "warning";
  return "active";
}

const STATUS_CONFIG: Record<SystemStatus, { label: string; bg: string; text: string; dot: string }> = {
  active: {
    label: "All Systems Active",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-400",
    dot: "#34d399",
  },
  warning: {
    label: "Partial Outage",
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-400",
    dot: "#fbbf24",
  },
  down: {
    label: "Systems Down",
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-400",
    dot: "#f87171",
  },
};

export function StatusHeader({ machines, latestTs, isLoading }: StatusHeaderProps) {
  const status = getSystemStatus(machines, latestTs, isLoading);
  const config = STATUS_CONFIG[status];

  return (
    <header className="text-center">
      <h1 className="text-lg font-semibold tracking-tight">ClawPi Scout</h1>
      <div
        className={`mt-2.5 mx-auto inline-flex items-center gap-2 rounded-full border px-3.5 py-1 ${config.bg}`}
      >
        <span
          className={`status-dot ${status === "active" ? "status-dot-pulse" : ""}`}
          style={{ backgroundColor: config.dot, color: config.dot }}
        />
        <span className={`text-xs font-medium ${config.text}`}>
          {config.label}
        </span>
      </div>
    </header>
  );
}
