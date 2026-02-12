"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AlertEntry, MachineId } from "@/lib/types";
import { MACHINE_META } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface AlertsListProps {
  alerts: AlertEntry[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mx-auto flex w-full max-w-lg items-center justify-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.03] cursor-pointer"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Recent Alerts
        </h2>
        {alerts.length > 0 && (
          <span className="text-[11px] font-mono text-muted">{alerts.length}</span>
        )}
        <svg
          className={`ml-1 h-3 w-3 text-muted/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="pt-2.5">
              <div className="card-base card-glow-top rounded-xl px-4 py-3">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
