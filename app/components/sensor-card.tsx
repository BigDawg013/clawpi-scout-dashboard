"use client";

import type { SensorStats, DashboardState } from "@/lib/types";
import { formatTemp } from "@/lib/utils";

interface SensorCardProps {
  sensor: SensorStats | null;
  dashboard: DashboardState | null;
}

export function SensorCard({ sensor, dashboard }: SensorCardProps) {
  const ledColor =
    dashboard?.led_state === "green"
      ? "#22c55e"
      : dashboard?.led_state === "red"
        ? "#ef4444"
        : dashboard?.led_state === "yellow"
          ? "#eab308"
          : "#3f3f46";

  const matrixLabel: Record<string, string> = {
    smiley: ":)",
    x: "X",
    check: "\u2713",
    heart: "\u2665",
    exclaim: "!",
    blank: "-",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
        Environment & Display
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* DHT11 sensor */}
        <div>
          <div className="mb-1 text-xs text-muted">Temperature</div>
          <div className="text-lg font-bold">
            {sensor?.temperature !== null && sensor?.temperature !== undefined
              ? formatTemp(sensor.temperature)
              : "--"}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-muted">Humidity</div>
          <div className="text-lg font-bold">
            {sensor?.humidity !== null && sensor?.humidity !== undefined
              ? `${sensor.humidity.toFixed(0)}%`
              : "--"}
          </div>
        </div>

        {/* Physical dashboard state */}
        <div>
          <div className="mb-1 text-xs text-muted">LED Status</div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: ledColor }}
            />
            <span className="text-sm capitalize">{dashboard?.led_state ?? "off"}</span>
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-muted">Matrix</div>
          <div className="text-lg font-bold">
            {dashboard?.matrix_pattern
              ? matrixLabel[dashboard.matrix_pattern] ?? dashboard.matrix_pattern
              : "--"}
          </div>
        </div>
      </div>
    </div>
  );
}
