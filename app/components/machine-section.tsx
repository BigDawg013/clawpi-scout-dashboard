"use client";

import { MACHINE_META } from "@/lib/types";
import type { MachineId, MachineData } from "@/lib/types";
import { formatRelativeTime, formatUptime, formatTemp, formatMemory } from "@/lib/utils";
import { GatewayCard } from "./gateway-card";
import { VitalsCard } from "./vitals-card";
import { SensorCard } from "./sensor-card";

interface MachineSectionProps {
  machineId: MachineId;
  data: MachineData | null;
}

export function MachineSection({ machineId, data }: MachineSectionProps) {
  const meta = MACHINE_META[machineId];
  const current = data?.current;
  const online = current && (Date.now() / 1000 - current.ts) < 300;

  return (
    <section id={machineId}>
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            !current ? "bg-zinc-600" : online ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">
          {meta.label}
        </h2>
        <span className="text-xs text-muted">{meta.description}</span>
        {current && (
          <span className="ml-auto text-xs text-muted">
            {formatRelativeTime(current.ts)}
          </span>
        )}
      </div>

      {!current ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Waiting for data from {meta.label}...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Gateway card only for clawpiscout */}
          {current.gateway && (
            <GatewayCard
              gateway={current.gateway}
              dashboard={current.dashboard ?? null}
            />
          )}
          <VitalsCard system={current.system} />
          {/* Sensor card only if sensor data exists */}
          {current.sensor && (current.sensor.temperature !== null || current.sensor.humidity !== null) && (
            <SensorCard
              sensor={current.sensor}
              dashboard={current.dashboard ?? null}
            />
          )}
        </div>
      )}
    </section>
  );
}
