"use client";

import useSWR from "swr";
import type { StatsResponse } from "@/lib/types";

const fetcher = (url: string): Promise<StatsResponse> =>
  fetch(url).then((r) => r.json());

export function useStats() {
  return useSWR<StatsResponse>("/api/stats", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });
}
