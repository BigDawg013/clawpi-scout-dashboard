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
  key: string;
}

export interface ScoutPayload {
  ts: number;
  gateway: GatewayStats;
  system: SystemStats;
  sensor: SensorStats;
  dashboard: DashboardState;
  alerts: AlertEntry[];
}

export interface StatsResponse {
  current: ScoutPayload | null;
  history: ScoutPayload[];
  alerts: AlertEntry[];
  monitoring_since: string | null;
}
