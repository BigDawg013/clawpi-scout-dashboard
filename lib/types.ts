export interface GatewayStats {
  status: "up" | "down";
  consecutive_ok: number;
  uptime_seconds: number;
}

export interface SystemStats {
  cpu_temp: number;
  disk_used_pct: number;
  mem_total_mb: number;
  mem_available_mb: number;
  load_avg: string;
}

export interface SensorStats {
  temperature: number | null;
  humidity: number | null;
}

export interface DashboardState {
  health_score: number;
  led_state: "green" | "red" | "yellow" | "off";
  matrix_pattern: string;
}

export interface AlertEntry {
  ts: number;
  message: string;
  machine?: string;
}

export interface ScoutPayload {
  ts: number;
  machine?: string;
  gateway?: GatewayStats;
  system: SystemStats;
  sensor?: SensorStats;
  dashboard?: DashboardState;
  alerts?: AlertEntry[];
}

export interface MachineData {
  current: ScoutPayload | null;
  history: ScoutPayload[];
}

export type MachineId = "clawpiscout" | "clawpi" | "macmini";

export const MACHINE_META: Record<MachineId, { label: string; description: string }> = {
  clawpiscout: { label: "Scout Pi", description: "8GB — watchdog daemon" },
  clawpi: { label: "ClawPi", description: "4GB — AI gateway" },
  macmini: { label: "Mac Mini", description: "Hub — multi-agent system" },
};

export interface StatsResponse {
  machines: Record<string, MachineData>;
  alerts: AlertEntry[];
  monitoring_since: string | null;
}
