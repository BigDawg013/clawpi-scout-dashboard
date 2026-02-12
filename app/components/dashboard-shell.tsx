"use client";

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

  // Find the most recent timestamp across all machines
  const latestTs = Object.values(machines).reduce((max, m) => {
    const ts = m.current?.ts ?? 0;
    return ts > max ? ts : max;
  }, 0);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <StatusHeader machines={{}} latestTs={0} isLoading={false} monitoringSince={null} />
        <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">Failed to load dashboard data</p>
          <p className="mt-1 text-sm text-muted">Check API route and Redis connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <StatusHeader
        machines={machines}
        latestTs={latestTs}
        isLoading={isLoading}
        monitoringSince={data?.monitoring_since ?? null}
      />

      <div className="mt-6 space-y-8">
        {MACHINE_ORDER.map((id) => (
          <MachineSection key={id} machineId={id} data={machines[id] ?? null} />
        ))}
      </div>

      <div className="mt-8">
        <HistoryChart machines={machines} />
      </div>

      <div className="mt-4">
        <AlertsList alerts={alerts} />
      </div>

      <footer className="mt-8 pb-4 text-center text-xs text-muted">
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
    </div>
  );
}
