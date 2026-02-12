"use client";

import type { SystemStats } from "@/lib/types";
import { formatTemp, formatMemory } from "@/lib/utils";

interface VitalsCardProps {
  system: SystemStats | null;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function VitalsCard({ system }: VitalsCardProps) {
  if (!system) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Pi Vitals
        </div>
        <p className="text-sm text-muted">Waiting for data...</p>
      </div>
    );
  }

  const memUsedMb = system.mem_total_mb - system.mem_available_mb;
  const memPct = (memUsedMb / system.mem_total_mb) * 100;
  const tempColor = system.cpu_temp >= 70 ? "#ef4444" : system.cpu_temp >= 55 ? "#eab308" : "#06b6d4";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
        Pi Vitals
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-secondary">CPU Temp</span>
            <span className="font-medium" style={{ color: tempColor }}>
              {formatTemp(system.cpu_temp)}
            </span>
          </div>
          <ProgressBar value={system.cpu_temp} max={85} color={tempColor} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-secondary">Memory</span>
            <span className="font-medium">
              {formatMemory(memUsedMb)} / {formatMemory(system.mem_total_mb)}
            </span>
          </div>
          <ProgressBar
            value={memPct}
            max={100}
            color={memPct > 85 ? "#ef4444" : memPct > 60 ? "#eab308" : "#22c55e"}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-secondary">Disk</span>
            <span className="font-medium">{system.disk_used_pct.toFixed(1)}%</span>
          </div>
          <ProgressBar
            value={system.disk_used_pct}
            max={100}
            color={system.disk_used_pct > 85 ? "#ef4444" : system.disk_used_pct > 60 ? "#eab308" : "#22c55e"}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">Load Avg</span>
          <span className="font-medium">{system.load_avg}</span>
        </div>
      </div>
    </div>
  );
}
