"use client";

import { motion } from "framer-motion";
import { useStats } from "@/hooks/use-stats";
import { StatusHeader } from "./status-header";
import { MachineSection } from "./machine-section";
import { HistoryChart } from "./history-chart";
import { AlertsList } from "./alerts-list";
import type { MachineId } from "@/lib/types";

const MACHINE_ORDER: MachineId[] = ["clawpiscout", "clawpi", "macmini"];

export function DashboardShell() {
  const { data, isLoading, error } = useStats();

  const machines = data?.machines ?? {};
  const alerts = data?.alerts ?? [];

  const latestTs = Object.values(machines).reduce((max, m) => {
    const ts = m.current?.ts ?? 0;
    return ts > max ? ts : max;
  }, 0);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <StatusHeader machines={{}} latestTs={0} isLoading={false} monitoringSince={null} />
        <div className="mt-6 card-base card-glow-top rounded-xl p-5 text-center">
          <p className="text-down text-sm">Failed to load dashboard data</p>
          <p className="mt-1 text-xs text-muted">Check API route and Redis connection</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-5xl px-4 py-6 sm:px-6"
    >
      <StatusHeader
        machines={machines}
        latestTs={latestTs}
        isLoading={isLoading}
        monitoringSince={data?.monitoring_since ?? null}
      />

      <div className="mt-6">
        {MACHINE_ORDER.map((id, index) => (
          <div key={id} className={index > 0 ? "mt-5 border-t border-border/30 pt-5" : ""}>
            <MachineSection machineId={id} data={machines[id] ?? null} />
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border/30 pt-5 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <HistoryChart machines={machines} />
        </div>
        <div className="lg:col-span-2">
          <AlertsList alerts={alerts} />
        </div>
      </div>

      <footer className="mt-8 border-t border-border/30 pt-4 pb-3 text-center text-xs text-muted/70">
        <a
          href="https://github.com/BigDawg013/clawpi-scout"
          className="hover:text-secondary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          clawpi-scout
        </a>
        {" "}&middot;{" "}
        <a
          href="https://github.com/BigDawg013/clawpi-scout-dashboard"
          className="hover:text-secondary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          dashboard source
        </a>
        {" "}&middot;{" "}
        Powered by{" "}
        <a
          href="https://openclaw.ai"
          className="hover:text-secondary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenClaw
        </a>
      </footer>
    </motion.div>
  );
}
