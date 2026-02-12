"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MACHINE_META } from "@/lib/types";
import type { MachineId, MachineData } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { VitalsCard } from "./vitals-card";
import { SensorCard } from "./sensor-card";

interface MachineSectionProps {
  machineId: MachineId;
  data: MachineData | null;
  defaultOpen?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export function MachineSection({ machineId, data, defaultOpen = false }: MachineSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const meta = MACHINE_META[machineId];
  const current = data?.current;
  const online = current && (Date.now() / 1000 - current.ts) < 300;

  const dotColor = !current ? "#3f3f46" : online ? "#34d399" : "#f87171";

  return (
    <section id={machineId}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mx-auto flex w-full max-w-lg items-center justify-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/[0.03] cursor-pointer"
      >
        <span
          className={`status-dot ${online ? "status-dot-pulse" : ""}`}
          style={{ backgroundColor: dotColor, color: dotColor }}
        />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary">
          {meta.label}
        </h2>
        <span className="hidden text-[11px] text-muted sm:inline">{meta.description}</span>
        {current && (
          <span className="text-[11px] font-mono text-muted">
            &middot; {formatRelativeTime(current.ts)}
          </span>
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
              {!current ? (
                <div className="mx-auto max-w-lg card-base card-glow-top rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-muted">Waiting for data from {meta.label}...</p>
                </div>
              ) : (() => {
                const hasSensor = !!(current.sensor && (current.sensor.temperature !== null || current.sensor.humidity !== null));

                return (
                  <motion.div
                    className={hasSensor ? "mx-auto max-w-3xl grid gap-3 sm:grid-cols-2" : "mx-auto max-w-lg"}
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                  >
                    <motion.div variants={cardVariants}>
                      <VitalsCard
                        system={current.system}
                        gateway={current.gateway ?? null}
                        dashboard={current.dashboard ?? null}
                      />
                    </motion.div>
                    {hasSensor && (
                      <motion.div variants={cardVariants}>
                        <SensorCard
                          sensor={current.sensor!}
                          dashboard={current.dashboard ?? null}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
