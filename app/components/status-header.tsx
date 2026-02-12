"use client";

import { formatRelativeTime } from "@/lib/utils";
import { MACHINE_META } from "@/lib/types";
import type { MachineData, MachineId } from "@/lib/types";

interface StatusHeaderProps {
  machines: Record<string, MachineData>;
  latestTs: number;
  isLoading: boolean;
  monitoringSince: string | null;
}

export function StatusHeader({ machines, latestTs, isLoading, monitoringSince }: StatusHeaderProps) {
  const isStale = latestTs ? Date.now() / 1000 - latestTs > 300 : true;

  const dotColor = isLoading ? "#fbbf24" : isStale ? "#f87171" : "#34d399";

  return (
    <header className="relative">
      {/* Subtle gradient wash behind header */}
      <div className="pointer-events-none absolute -inset-x-4 -top-8 h-40 bg-gradient-to-b from-white/[0.015] to-transparent" />

      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ClawPi Scout</h1>
            <p className="mt-0.5 text-xs text-muted">System Monitoring Dashboard</p>
          </div>
          <span
            className={`status-dot ${!isLoading && !isStale ? "status-dot-pulse" : ""}`}
            style={{ backgroundColor: dotColor, color: dotColor }}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          {latestTs > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1 w-1 rounded-full bg-up/60" />
              <span className="font-mono">Updated {formatRelativeTime(latestTs)}</span>
            </span>
          )}
          {monitoringSince && (
            <span className="hidden sm:inline">
              Since {new Date(monitoringSince).toLocaleDateString()}
            </span>
          )}
          <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium tracking-wider text-muted">
            LIVE
          </span>
        </div>
      </div>

      {/* Machine status badges */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {(Object.keys(MACHINE_META) as MachineId[]).map((id) => {
          const meta = MACHINE_META[id];
          const data = machines[id];
          const current = data?.current;
          const online = current && (Date.now() / 1000 - current.ts) < 300;

          const badgeDotColor = !current ? "#3f3f46" : online ? "#34d399" : "#f87171";

          return (
            <a
              key={id}
              href={`#${id}`}
              className="badge-hover group flex items-center gap-2.5 rounded-xl border border-border/50 bg-white/[0.02] px-3.5 py-2.5 text-sm backdrop-blur-sm transition-all hover:border-border hover:bg-white/[0.04]"
            >
              <span
                className="status-dot"
                style={{ backgroundColor: badgeDotColor, color: badgeDotColor }}
              />
              <span className="font-medium text-foreground">{meta.label}</span>
              <span className="text-xs text-muted transition-colors group-hover:text-secondary">
                {meta.description}
              </span>
            </a>
          );
        })}
      </div>
    </header>
  );
}
