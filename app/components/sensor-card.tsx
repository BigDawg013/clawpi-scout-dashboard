"use client";

import type { SensorStats, DashboardState } from "@/lib/types";
import { formatTemp } from "@/lib/utils";

interface SensorCardProps {
  sensor: SensorStats | null;
  dashboard: DashboardState | null;
}

export function SensorCard({ sensor, dashboard }: SensorCardProps) {
  const ledColorMap: Record<string, string> = {
    green: "#34d399",
    red: "#f87171",
    yellow: "#fbbf24",
    off: "#3f3f46",
  };
  const ledColor = ledColorMap[dashboard?.led_state ?? "off"] ?? "#3f3f46";

  const matrixLabel: Record<string, string> = {
    smiley: ":)",
    x: "X",
    check: "\u2713",
    heart: "\u2665",
    exclaim: "!",
    blank: "-",
  };

  return (
    <div className="card-base card-glow-top rounded-2xl p-5">
      <div className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted">
        Environment & Display
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1 text-xs text-muted">Temperature</div>
          <div className="font-mono text-lg font-bold">
            {sensor?.temperature !== null && sensor?.temperature !== undefined
              ? formatTemp(sensor.temperature)
              : "--"}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-muted">Humidity</div>
          <div className="font-mono text-lg font-bold">
            {sensor?.humidity !== null && sensor?.humidity !== undefined
              ? `${sensor.humidity.toFixed(0)}%`
              : "--"}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted">LED Status</div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{
                backgroundColor: ledColor,
                boxShadow: dashboard?.led_state !== "off" ? `0 0 12px ${ledColor}50` : "none",
              }}
            />
            <span className="text-sm capitalize">{dashboard?.led_state ?? "off"}</span>
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-muted">Matrix</div>
          <div className="font-mono text-lg font-bold">
            {dashboard?.matrix_pattern
              ? matrixLabel[dashboard.matrix_pattern] ?? dashboard.matrix_pattern
              : "--"}
          </div>
        </div>
      </div>
    </div>
  );
}
