"use client";

import { MACHINE_META } from "@/lib/types";
import type { MachineData, MachineId } from "@/lib/types";

interface StatusHeaderProps {
  machines: Record<string, MachineData>;
  latestTs: number;
  isLoading: boolean;
}

export function StatusHeader({ machines, latestTs, isLoading }: StatusHeaderProps) {
  const isStale = latestTs ? Date.now() / 1000 - latestTs > 300 : true;
  const dotColor = isLoading ? "#fbbf24" : isStale ? "#f87171" : "#34d399";

  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-lg font-semibold tracking-tight">ClawPi Scout</h1>
        <span
          className={`status-dot ${!isLoading && !isStale ? "status-dot-pulse" : ""}`}
          style={{ backgroundColor: dotColor, color: dotColor }}
        />
      </div>

      <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
        {(Object.keys(MACHINE_META) as MachineId[]).map((id) => {
          const data = machines[id];
          const current = data?.current;
          const online = current && (Date.now() / 1000 - current.ts) < 300;
          const badgeDotColor = !current ? "#3f3f46" : online ? "#34d399" : "#f87171";

          return (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-white/[0.04]"
            >
              <span
                className="status-dot"
                style={{ backgroundColor: badgeDotColor, color: badgeDotColor }}
              />
              <span className="text-secondary">{MACHINE_META[id].label}</span>
            </a>
          );
        })}
      </div>
    </header>
  );
}
