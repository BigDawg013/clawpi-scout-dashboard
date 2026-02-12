"use client";

import { useStats } from "@/hooks/use-stats";
import { StatusHeader } from "./status-header";
import { GatewayCard } from "./gateway-card";
import { VitalsCard } from "./vitals-card";
import { SensorCard } from "./sensor-card";
import { HistoryChart } from "./history-chart";
import { AlertsList } from "./alerts-list";

export function DashboardShell() {
  const { data, isLoading, error } = useStats();

  const current = data?.current ?? null;
  const history = data?.history ?? [];
  const alerts = data?.alerts ?? [];

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <StatusHeader lastTs={null} isLoading={false} monitoringSince={null} />
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
        lastTs={current?.ts ?? null}
        isLoading={isLoading}
        monitoringSince={data?.monitoring_since ?? null}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <GatewayCard
          gateway={current?.gateway ?? null}
          dashboard={current?.dashboard ?? null}
        />
        <VitalsCard system={current?.system ?? null} />
      </div>

      <div className="mt-4">
        <SensorCard
          sensor={current?.sensor ?? null}
          dashboard={current?.dashboard ?? null}
        />
      </div>

      <div className="mt-4">
        <HistoryChart history={history} />
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
