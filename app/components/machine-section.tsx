"use client";

import { motion } from "framer-motion";
import { MACHINE_META } from "@/lib/types";
import type { MachineId, MachineData } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { GatewayCard } from "./gateway-card";
import { VitalsCard } from "./vitals-card";
import { SensorCard } from "./sensor-card";

interface MachineSectionProps {
  machineId: MachineId;
  data: MachineData | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export function MachineSection({ machineId, data }: MachineSectionProps) {
  const meta = MACHINE_META[machineId];
  const current = data?.current;
  const online = current && (Date.now() / 1000 - current.ts) < 300;

  const dotColor = !current ? "#3f3f46" : online ? "#34d399" : "#f87171";

  return (
    <section id={machineId}>
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`status-dot ${online ? "status-dot-pulse" : ""}`}
          style={{ backgroundColor: dotColor, color: dotColor }}
        />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">
          {meta.label}
        </h2>
        <span className="text-xs text-muted">{meta.description}</span>
        {current && (
          <span className="ml-auto text-xs font-mono text-muted">
            {formatRelativeTime(current.ts)}
          </span>
        )}
      </div>

      {!current ? (
        <div className="card-base card-glow-top rounded-2xl p-5">
          <p className="text-sm text-muted">Waiting for data from {meta.label}...</p>
        </div>
      ) : (
        <motion.div
          className="grid gap-5 sm:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {current.gateway && (
            <motion.div variants={cardVariants}>
              <GatewayCard
                gateway={current.gateway}
                dashboard={current.dashboard ?? null}
              />
            </motion.div>
          )}
          <motion.div variants={cardVariants}>
            <VitalsCard system={current.system} />
          </motion.div>
          {current.sensor && (current.sensor.temperature !== null || current.sensor.humidity !== null) && (
            <motion.div variants={cardVariants}>
              <SensorCard
                sensor={current.sensor}
                dashboard={current.dashboard ?? null}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </section>
  );
}
