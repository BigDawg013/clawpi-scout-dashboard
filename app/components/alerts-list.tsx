"use client";

import type { AlertEntry, MachineId } from "@/lib/types";
import { MACHINE_META } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface AlertsListProps {
  alerts: AlertEntry[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="card-base card-glow-top rounded-2xl p-5">
      <div className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted">
        Recent Alerts
      </div>

      {alerts.length === 0 ? (
        <div className="flex h-24 items-center justify-center text-sm text-muted/60">
          No alerts recorded
        </div>
      ) : (
        <div className="scrollbar-thin max-h-60 space-y-1 overflow-y-auto">
          {alerts.map((alert, i) => {
            const isRecovery = alert.message.toLowerCase().includes("recover");
            const machineLabel = alert.machine
              ? MACHINE_META[alert.machine as MachineId]?.label ?? alert.machine
              : null;
            return (
              <div
                key={`${alert.ts}-${i}`}
                className="group flex items-start gap-3 rounded-xl px-3.5 py-3 text-sm transition-colors hover:bg-white/[0.03]"
              >
                <div
                  className="mt-1 h-4 w-0.5 shrink-0 rounded-full"
                  style={{ backgroundColor: isRecovery ? "#34d399" : "#f87171" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-foreground/90">{alert.message}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                    {machineLabel && (
                      <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 font-medium">
                        {machineLabel}
                      </span>
                    )}
                    <span className="font-mono">{formatRelativeTime(alert.ts)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
