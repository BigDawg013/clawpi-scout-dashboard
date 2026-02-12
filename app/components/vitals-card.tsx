"use client";

import type { SystemStats } from "@/lib/types";
import { formatTemp, formatMemory } from "@/lib/utils";

interface VitalsCardProps {
  system: SystemStats | null;
}

function ProgressBar({ value, max, color, gradientTo }: { value: number; max: number; color: string; gradientTo?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: gradientTo ? `linear-gradient(90deg, ${color}, ${gradientTo})` : color,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </div>
  );
}

function getGradientPair(value: number, thresholds: [number, number]): { color: string; gradientTo: string } {
  if (value > thresholds[1]) return { color: "#f87171", gradientTo: "#fca5a5" };
  if (value > thresholds[0]) return { color: "#fbbf24", gradientTo: "#fcd34d" };
  return { color: "#34d399", gradientTo: "#6ee7b7" };
}

export function VitalsCard({ system }: VitalsCardProps) {
  if (!system) {
    return (
      <div className="card-base card-glow-top rounded-2xl p-5">
        <div className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted">
          System Vitals
        </div>
        <p className="text-sm text-muted">Waiting for data...</p>
      </div>
    );
  }

  const memUsedMb = system.mem_total_mb - system.mem_available_mb;
  const memPct = (memUsedMb / system.mem_total_mb) * 100;

  const tempColor = system.cpu_temp >= 70 ? "#f87171" : system.cpu_temp >= 55 ? "#fbbf24" : "#22d3ee";
  const tempGradient = system.cpu_temp >= 70 ? "#fca5a5" : system.cpu_temp >= 55 ? "#fcd34d" : "#67e8f9";
  const memColors = getGradientPair(memPct, [60, 85]);
  const diskColors = getGradientPair(system.disk_used_pct, [60, 85]);

  return (
    <div className="card-base card-glow-top rounded-2xl p-5">
      <div className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted">
        System Vitals
      </div>

      <div className="space-y-3">
        {system.cpu_temp > 0 && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-secondary">CPU Temp</span>
              <span className="font-mono font-medium" style={{ color: tempColor }}>
                {formatTemp(system.cpu_temp)}
              </span>
            </div>
            <ProgressBar value={system.cpu_temp} max={85} color={tempColor} gradientTo={tempGradient} />
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-secondary">Memory</span>
            <span className="font-mono font-medium">
              {formatMemory(memUsedMb)} / {formatMemory(system.mem_total_mb)}
            </span>
          </div>
          <ProgressBar value={memPct} max={100} color={memColors.color} gradientTo={memColors.gradientTo} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-secondary">Disk</span>
            <span className="font-mono font-medium">{system.disk_used_pct.toFixed(1)}%</span>
          </div>
          <ProgressBar value={system.disk_used_pct} max={100} color={diskColors.color} gradientTo={diskColors.gradientTo} />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">Load Avg</span>
          <span className="font-mono font-medium">{system.load_avg}</span>
        </div>
      </div>
    </div>
  );
}
