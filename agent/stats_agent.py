#!/usr/bin/env python3
"""Lightweight stats agent — pushes system vitals to the ClawPi Scout Dashboard.

Works on both Linux (Raspberry Pi) and macOS (Mac Mini).
No dependencies beyond the standard library + urllib.

Usage:
  export DASHBOARD_URL="https://clawpi-scout-dashboard.vercel.app/api/stats"
  export DASHBOARD_API_KEY="your-key"
  export MACHINE_ID="clawpi"  # or "macmini"
  python3 stats_agent.py

Or with a config file:
  python3 stats_agent.py --config agent.yaml
"""

import json
import logging
import os
import platform
import shutil
import subprocess
import sys
import time
import urllib.request
import urllib.error

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [stats-agent] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("stats-agent")


def get_system_stats_linux() -> dict:
    """Collect system stats on Linux (Raspberry Pi)."""
    disk = shutil.disk_usage("/")

    mem = {}
    try:
        with open("/proc/meminfo") as f:
            for line in f:
                parts = line.split()
                if parts[0] in ("MemTotal:", "MemAvailable:"):
                    mem[parts[0].rstrip(":")] = int(parts[1]) // 1024  # MB
    except Exception:
        pass

    load_avg = "0"
    try:
        with open("/proc/loadavg") as f:
            load_avg = f.read().split()[0]
    except Exception:
        pass

    cpu_temp = 0.0
    try:
        with open("/sys/class/thermal/thermal_zone0/temp") as f:
            cpu_temp = int(f.read().strip()) / 1000
    except Exception:
        pass

    return {
        "cpu_temp": round(cpu_temp, 1),
        "disk_used_pct": round(disk.used / disk.total * 100, 1),
        "mem_total_mb": mem.get("MemTotal", 0),
        "mem_available_mb": mem.get("MemAvailable", 0),
        "load_avg": load_avg,
    }


def get_system_stats_macos() -> dict:
    """Collect system stats on macOS."""
    disk = shutil.disk_usage("/")

    # Memory via sysctl
    mem_total_mb = 0
    mem_available_mb = 0
    try:
        out = subprocess.check_output(["sysctl", "-n", "hw.memsize"], text=True)
        mem_total_mb = int(out.strip()) // (1024 * 1024)
    except Exception:
        pass

    try:
        out = subprocess.check_output(["vm_stat"], text=True)
        page_size = 16384  # Apple Silicon default
        free = 0
        inactive = 0
        for line in out.splitlines():
            if "page size of" in line:
                page_size = int(line.split()[-2])
            if "Pages free" in line:
                free = int(line.split()[-1].rstrip("."))
            if "Pages inactive" in line:
                inactive = int(line.split()[-1].rstrip("."))
        mem_available_mb = (free + inactive) * page_size // (1024 * 1024)
    except Exception:
        pass

    # Load average
    load_avg = "0"
    try:
        load = os.getloadavg()
        load_avg = f"{load[0]:.2f}"
    except Exception:
        pass

    # CPU temp via powermetrics (requires sudo) or smckit — fallback to 0
    cpu_temp = 0.0
    try:
        out = subprocess.check_output(
            ["sudo", "-n", "powermetrics", "--samplers", "smc", "-n", "1", "-i", "1"],
            text=True, timeout=5, stderr=subprocess.DEVNULL,
        )
        for line in out.splitlines():
            if "CPU die temperature" in line:
                cpu_temp = float(line.split()[-2])
                break
    except Exception:
        pass

    return {
        "cpu_temp": round(cpu_temp, 1),
        "disk_used_pct": round(disk.used / disk.total * 100, 1),
        "mem_total_mb": mem_total_mb,
        "mem_available_mb": mem_available_mb,
        "load_avg": load_avg,
    }


def get_system_stats() -> dict:
    if platform.system() == "Darwin":
        return get_system_stats_macos()
    return get_system_stats_linux()


def push_stats(url: str, api_key: str, machine_id: str) -> bool:
    """Collect and push stats to the dashboard API."""
    system = get_system_stats()
    payload = {
        "ts": int(time.time()),
        "machine": machine_id,
        "system": system,
    }

    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                log.debug("stats pushed successfully")
                return True
            else:
                log.warning("push failed: %d", resp.status)
                return False
    except urllib.error.HTTPError as e:
        log.warning("push failed: %d %s", e.code, e.reason)
        return False
    except Exception as e:
        log.warning("push error: %s", e)
        return False


def load_config(path: str) -> dict:
    """Load config from YAML file (optional, falls back to env vars)."""
    try:
        import yaml
        with open(path) as f:
            return yaml.safe_load(f) or {}
    except ImportError:
        log.info("pyyaml not installed — using env vars")
        return {}
    except FileNotFoundError:
        return {}


def main():
    import argparse
    parser = argparse.ArgumentParser(description="ClawPi Scout stats agent")
    parser.add_argument("--config", default="agent.yaml", help="Config file path")
    args = parser.parse_args()

    config = load_config(args.config)

    url = config.get("url") or os.environ.get("DASHBOARD_URL", "")
    api_key = config.get("api_key") or os.environ.get("DASHBOARD_API_KEY", "")
    machine_id = config.get("machine_id") or os.environ.get("MACHINE_ID", "")
    interval = int(config.get("push_interval", os.environ.get("PUSH_INTERVAL", "60")))

    if not url or not api_key or not machine_id:
        print("ERROR: Missing required config. Set DASHBOARD_URL, DASHBOARD_API_KEY, MACHINE_ID")
        print("  Or create agent.yaml with url, api_key, machine_id fields")
        sys.exit(1)

    log.info("starting — machine=%s interval=%ds url=%s", machine_id, interval, url)

    while True:
        push_stats(url, api_key, machine_id)
        try:
            time.sleep(interval)
        except KeyboardInterrupt:
            log.info("stopped")
            break


if __name__ == "__main__":
    main()
