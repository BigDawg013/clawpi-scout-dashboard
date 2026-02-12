"use client";

import type { AlertEntry, MachineId } from "@/lib/types";
import { MACHINE_META } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface AlertsListProps {
  alerts: AlertEntry[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="card-base card-glow-top rounded-xl px-4 py-3">
      <div className="mb-2.5 text-[10px] font-medium uppercase tracking-wider text-muted">
        Recent Alerts
      </div>

      {alerts.length === 0 ? (
        <div className="flex h-20 items-center justify-center text-xs text-muted/60">
          No alerts recorded
        </div>
      ) : (
        <div className="scrollbar-thin max-h-52 space-y-0.5 overflow-y-auto">
          {alerts.map((alert, i) => {
            const isRecovery = alert.message.toLowerCase().includes("recover");
            const machineLabel = alert.machine
              ? MACHINE_META[alert.machine as MachineId]?.label ?? alert.machine
              : null;
            return (
              <div
                key={`${alert.ts}-${i}`}
                className="group flex items-start gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-white/[0.03]"
              >
                <div
                  className="mt-0.5 h-3.5 w-0.5 shrink-0 rounded-full"
                  style={{ backgroundColor: isRecovery ? "#34d399" : "#f87171" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-foreground/90 leading-snug">{alert.message}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                    {machineLabel && (
                      <span className="rounded bg-white/[0.04] px-1 py-px font-medium">
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
