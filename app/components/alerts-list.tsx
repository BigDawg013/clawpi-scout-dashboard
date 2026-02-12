"use client";

import type { AlertEntry } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface AlertsListProps {
  alerts: AlertEntry[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
        Recent Alerts
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-muted">No alerts yet</p>
      ) : (
        <div className="max-h-60 space-y-2 overflow-y-auto">
          {alerts.map((alert, i) => {
            const isRecovery =
              alert.key === "recovery" || alert.message.toLowerCase().includes("recover");
            return (
              <div
                key={`${alert.ts}-${i}`}
                className="flex items-start gap-3 rounded-lg bg-zinc-900/50 px-3 py-2 text-sm"
              >
                <span
                  className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                    isRecovery ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-foreground">{alert.message}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatRelativeTime(alert.ts)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
