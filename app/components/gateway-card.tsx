"use client";

import type { GatewayStats, DashboardState } from "@/lib/types";
import { formatUptime } from "@/lib/utils";

interface GatewayCardProps {
  gateway: GatewayStats | null;
  dashboard: DashboardState | null;
}

export function GatewayCard({ gateway, dashboard }: GatewayCardProps) {
  const isUp = gateway?.status === "up";
  const score = dashboard?.health_score ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
        Gateway Status
      </div>

      <div className="mb-4 flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold ${
            gateway === null
              ? "bg-zinc-800 text-zinc-400"
              : isUp
                ? "bg-green-500/15 text-green-400"
                : "bg-red-500/15 text-red-400"
          }`}
        >
          {gateway === null ? "NO DATA" : isUp ? "UP" : "DOWN"}
        </span>
        {gateway && (
          <span className="text-sm text-secondary">
            {gateway.consecutive_ok > 0 && `${gateway.consecutive_ok} consecutive OK`}
          </span>
        )}
      </div>

      {gateway && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Uptime</span>
            <span className="font-medium">{formatUptime(gateway.uptime_seconds)}</span>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-secondary">Health Score</span>
              <span className="font-medium">{score}/10</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${score * 10}%`,
                  backgroundColor:
                    score >= 7 ? "#22c55e" : score >= 4 ? "#eab308" : "#ef4444",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {!gateway && (
        <p className="text-sm text-muted">Waiting for data from scout...</p>
      )}
    </div>
  );
}
