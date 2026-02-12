"use client";

import { formatRelativeTime } from "@/lib/utils";

interface StatusHeaderProps {
  lastTs: number | null;
  isLoading: boolean;
  monitoringSince: string | null;
}

export function StatusHeader({ lastTs, isLoading, monitoringSince }: StatusHeaderProps) {
  const isStale = lastTs ? Date.now() / 1000 - lastTs > 300 : true;

  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
        {lastTs && (
          <span>Updated {formatRelativeTime(lastTs)}</span>
        )}
        {monitoringSince && (
          <span className="hidden sm:inline text-muted">
            Monitoring since {new Date(monitoringSince).toLocaleDateString()}
          </span>
        )}
        <span className="text-muted">Auto-refresh 30s</span>
      </div>
    </header>
  );
}
