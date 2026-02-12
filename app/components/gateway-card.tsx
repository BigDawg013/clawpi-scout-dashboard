"use client";

import type { GatewayStats, DashboardState } from "@/lib/types";
import { formatUptime } from "@/lib/utils";

interface GatewayCardProps {
  gateway: GatewayStats | null;
  dashboard: DashboardState | null;
}

function ProgressBar({ value, max, color, gradientTo }: { value: number; max: number; color: string; gradientTo?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: gradientTo ? `linear-gradient(90deg, ${color}, ${gradientTo})` : color,
          boxShadow: `0 0 6px ${color}30`,
        }}
      />
    </div>
  );
}

export function GatewayCard({ gateway, dashboard }: GatewayCardProps) {
  const isUp = gateway?.status === "up";
  const score = dashboard?.health_score ?? 0;

  const scoreColor = score >= 7 ? "#34d399" : score >= 4 ? "#fbbf24" : "#f87171";
  const scoreGradient = score >= 7 ? "#6ee7b7" : score >= 4 ? "#fcd34d" : "#fca5a5";

  return (
    <div className="card-base card-glow-top rounded-xl px-4 py-3">
      <div className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-muted">
        Gateway Status
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
            gateway === null
              ? "bg-zinc-800/50 text-zinc-400 ring-1 ring-zinc-700/50"
              : isUp
                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
          }`}
        >
          {gateway === null ? "NO DATA" : isUp ? "UP" : "DOWN"}
        </span>
        {gateway && gateway.consecutive_ok > 0 && (
          <span className="text-[11px] text-secondary">
            {gateway.consecutive_ok} consecutive OK
          </span>
        )}
      </div>

      {gateway && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">Uptime</span>
            <span className="font-mono font-medium">{formatUptime(gateway.uptime_seconds)}</span>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-secondary">Health Score</span>
              <span className="font-mono font-medium">{score}/10</span>
            </div>
            <ProgressBar value={score} max={10} color={scoreColor} gradientTo={scoreGradient} />
          </div>
        </div>
      )}

      {!gateway && (
        <p className="text-xs text-muted">Waiting for data from scout...</p>
      )}
    </div>
  );
}
