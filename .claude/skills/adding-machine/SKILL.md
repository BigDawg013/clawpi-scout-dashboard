---
description: Add a new machine to the monitoring dashboard
user_invocable: true
command: add-machine
---

# Add a New Machine

Add a new machine to the ClawPi Scout Dashboard monitoring system.

## Information Needed

Ask the user for:
- **Machine ID**: Short lowercase identifier (e.g., `newpi`, `server1`)
- **Label**: Display name (e.g., "New Pi", "Home Server")
- **Description**: Brief role description (e.g., "4GB — media server")
- **Chart color**: Hex color for the history chart line (e.g., `#f472b6`)

## Dashboard Code Changes

1. **`lib/types.ts`**:
   - Add the new ID to the `MachineId` union type
   - Add entry to `MACHINE_META` with label and description

2. **`app/components/history-chart.tsx`**:
   - Add the machine's chart color to the `CHART_COLORS` map

3. **`app/components/dashboard-shell.tsx`**:
   - Add the machine ID to the `MACHINE_ORDER` array

## Agent Setup on the New Machine

4. Copy `agent/stats_agent.py` to the new machine.

5. Create config (either `agent.yaml` or environment variables):
   - `DASHBOARD_URL`: `https://clawpi-scout-dashboard.vercel.app/api/stats`
   - `DASHBOARD_API_KEY`: The shared SCOUT_API_KEY
   - `MACHINE_ID`: The machine ID chosen above
   - `PUSH_INTERVAL`: 60 (seconds)

6. Set up as a service:
   - **Linux**: Create systemd unit file based on `agent/clawpi-stats-agent.service`
   - **macOS**: Create launchd plist based on `agent/com.clawpi.stats-agent.plist`

## Deploy

Use the `/deploy` skill to push changes and verify the new machine appears on the dashboard.
