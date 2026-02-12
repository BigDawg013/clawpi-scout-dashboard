import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { ScoutPayload, AlertEntry, StatsResponse } from "@/lib/types";

const HISTORY_MAX = 288; // 24h at 5-min intervals
const ALERTS_MAX = 50;
const CURRENT_TTL = 300; // seconds

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

  if (!payload.ts || !payload.gateway) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pipeline = redis.pipeline();

  // Always store current snapshot
  pipeline.set("scout:current", JSON.stringify(payload), { ex: CURRENT_TTL });

  // Store in history every 5th push (~5 min intervals)
  // Check push count to decide
  const pushCount = await redis.incr("scout:push_count");
  if (pushCount % 5 === 0) {
    pipeline.lpush("scout:history", JSON.stringify(payload));
    pipeline.ltrim("scout:history", 0, HISTORY_MAX - 1);
  }

  // Store alerts if any
  if (payload.alerts && payload.alerts.length > 0) {
    for (const alert of payload.alerts) {
      pipeline.lpush("scout:alerts", JSON.stringify(alert));
    }
    pipeline.ltrim("scout:alerts", 0, ALERTS_MAX - 1);
  }

  // Set monitoring_since on first push
  pipeline.setnx("scout:uptime", new Date().toISOString());

  await pipeline.exec();

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const pipeline = redis.pipeline();
  pipeline.get("scout:current");
  pipeline.lrange("scout:history", 0, HISTORY_MAX - 1);
  pipeline.lrange("scout:alerts", 0, ALERTS_MAX - 1);
  pipeline.get("scout:uptime");

  const results = await pipeline.exec();

  const currentRaw = results[0] as string | null;
  const historyRaw = results[1] as string[];
  const alertsRaw = results[2] as string[];
  const uptimeRaw = results[3] as string | null;

  const current: ScoutPayload | null = currentRaw
    ? (typeof currentRaw === "string" ? JSON.parse(currentRaw) : currentRaw)
    : null;

  const history: ScoutPayload[] = (historyRaw || []).map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  ).reverse(); // oldest first for charts

  const alerts: AlertEntry[] = (alertsRaw || []).map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );

  const response: StatsResponse = {
    current,
    history,
    alerts,
    monitoring_since: uptimeRaw,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
    },
  });
}
