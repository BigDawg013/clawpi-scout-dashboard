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
    <header className="text-center">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">ClawPi Scout</h1>
          <span
            className={`status-dot ${!isLoading && !isStale ? "status-dot-pulse" : ""}`}
            style={{ backgroundColor: dotColor, color: dotColor }}
          />
          <span className="rounded bg-white/[0.05] px-1.5 py-px text-[10px] font-medium tracking-wider text-muted">
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-muted">
          {latestTs > 0 && (
            <span className="font-mono">Updated {formatRelativeTime(latestTs)}</span>
          )}
          {monitoringSince && (
            <span className="hidden sm:inline text-muted/60">
              &middot; Since {new Date(monitoringSince).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Machine status badges */}
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
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
              className="badge-hover group flex items-center gap-1.5 rounded-lg border border-border/40 bg-white/[0.02] px-2.5 py-1.5 text-xs backdrop-blur-sm transition-all hover:border-border hover:bg-white/[0.04]"
            >
              <span
                className="status-dot"
                style={{ backgroundColor: badgeDotColor, color: badgeDotColor }}
              />
              <span className="font-medium text-foreground">{meta.label}</span>
              <span className="hidden text-[11px] text-muted transition-colors group-hover:text-secondary sm:inline">
                {meta.description}
              </span>
            </a>
          );
        })}
      </div>
    </header>
  );
}
