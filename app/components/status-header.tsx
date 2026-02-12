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
  const machineIds = Object.keys(machines) as MachineId[];

  return (
    <header>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">CLAWPI SCOUT</h1>
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              isLoading
                ? "bg-yellow-500 animate-pulse"
                : isStale
                  ? "bg-red-500"
                  : "bg-green-500 animate-pulse-dot"
            }`}
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-secondary">
          {latestTs > 0 && <span>Updated {formatRelativeTime(latestTs)}</span>}
          {monitoringSince && (
            <span className="hidden sm:inline text-muted">
              Monitoring since {new Date(monitoringSince).toLocaleDateString()}
            </span>
          )}
          <span className="text-muted">Auto-refresh 30s</span>
        </div>
      </div>

      {/* Machine status badges */}
      <div className="mt-4 flex flex-wrap gap-3">
        {(Object.keys(MACHINE_META) as MachineId[]).map((id) => {
          const meta = MACHINE_META[id];
          const data = machines[id];
          const current = data?.current;
          const online = current && (Date.now() / 1000 - current.ts) < 300;

          return (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-zinc-600"
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  !current ? "bg-zinc-600" : online ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="font-medium">{meta.label}</span>
              <span className="text-xs text-muted">{meta.description}</span>
            </a>
          );
        })}
      </div>
    </header>
  );
}
