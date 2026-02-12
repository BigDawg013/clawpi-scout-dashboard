import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { ScoutPayload, AlertEntry, StatsResponse, MachineData } from "@/lib/types";

const HISTORY_MAX = 288; // 24h at 5-min intervals
const ALERTS_MAX = 50;

export async function POST(req: NextRequest) {
  const apiKey = process.env.SCOUT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: ScoutPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.ts || !payload.system) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const machine = payload.machine || "clawpiscout";

  const pipeline = redis.pipeline();

  // Store current snapshot in hash (machine → JSON)
  pipeline.hset("scout:current", { [machine]: JSON.stringify(payload) });

  // Track known machines
  pipeline.sadd("scout:machines", machine);

  // Store in history every 5th push (~5 min intervals)
  const pushCount = await redis.incr(`scout:push_count:${machine}`);
  if (pushCount % 5 === 0) {
    pipeline.lpush(`scout:history:${machine}`, JSON.stringify(payload));
    pipeline.ltrim(`scout:history:${machine}`, 0, HISTORY_MAX - 1);
  }

  // Store alerts if any
  if (payload.alerts && payload.alerts.length > 0) {
    for (const alert of payload.alerts) {
      const entry: AlertEntry = { ...alert, machine };
      pipeline.lpush("scout:alerts", JSON.stringify(entry));
    }
    pipeline.ltrim("scout:alerts", 0, ALERTS_MAX - 1);
  }

  // Set monitoring_since on first push
  pipeline.setnx("scout:uptime", new Date().toISOString());

  await pipeline.exec();

  return NextResponse.json({ ok: true });
}

export async function GET() {
  // Get all known machines
  const knownMachines = await redis.smembers("scout:machines") as string[];

  // Get all current data in one hash read
  const currentHash = await redis.hgetall("scout:current") as Record<string, string> | null;

  // Build machine data with history
  const machines: Record<string, MachineData> = {};

  const historyPromises = knownMachines.map(async (machine) => {
    const rawHistory = await redis.lrange(`scout:history:${machine}`, 0, HISTORY_MAX - 1) as string[];
    const history: ScoutPayload[] = (rawHistory || [])
      .map((item) => (typeof item === "string" ? JSON.parse(item) : item))
      .reverse(); // oldest first for charts

    const rawCurrent = currentHash?.[machine];
    const current: ScoutPayload | null = rawCurrent
      ? (typeof rawCurrent === "string" ? JSON.parse(rawCurrent) : rawCurrent)
      : null;

    machines[machine] = { current, history };
  });

  await Promise.all(historyPromises);

  // Get alerts and uptime
  const [alertsRaw, uptimeRaw] = await Promise.all([
    redis.lrange("scout:alerts", 0, ALERTS_MAX - 1) as Promise<string[]>,
    redis.get("scout:uptime") as Promise<string | null>,
  ]);

  const alerts: AlertEntry[] = (alertsRaw || []).map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );

  const response: StatsResponse = {
    machines,
    alerts,
    monitoring_since: uptimeRaw,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
    },
  });
}
