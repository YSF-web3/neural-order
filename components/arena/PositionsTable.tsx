"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchPositions } from "@/lib/api-client";

type Position = {
  _id?: string;
  agentId: string;
  agentName: string;
  coin: string;
  signal: "long" | "short";
  entry_price: number;
  exit_price?: number;
  leverage: number;
  size_usd: number;
  opened_at: number;
  expected_duration: string;
  status: "open" | "closed";
  pnl?: number;
  pnlAbsolute?: number;
  aiReason?: string;
};

/**
 * PositionsTable
 * Displays recent positions. Default shows open; toggle to include closed.
 */
export default function PositionsTable() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [includeClosed, setIncludeClosed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  async function load(status?: "open" | "closed") {
    const data = await fetchPositions(100, undefined, status);
    return data as Position[];
  }

  useEffect(() => {
    let mounted = true;
    async function sync() {
      try {
        setLoading(true);
        const openData = await load("open");
        const closedData = includeClosed ? await load("closed") : [];
        if (!mounted) return;
        const merged = [...openData, ...closedData].sort((a, b) => b.opened_at - a.opened_at);
        setPositions(merged);
        setLoading(false);
      } catch (_err) {
        if (!mounted) return;
        setLoading(false);
      }
    }
    sync();
    const id = setInterval(sync, 6000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [includeClosed]);

  const rows = useMemo(() => positions.slice(0, 50), [positions]);

  return (
    <div className="space-y-4">
      {/* Controls and status */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 border-2 border-white accent-lime-400"
            checked={includeClosed}
            onChange={(e) => setIncludeClosed(e.target.checked)}
          />
          Include closed
        </label>
        <span className="text-xs font-mono text-lime-400">{loading ? "loading…" : `${rows.length} shown`}</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden border-4 border-white bg-black">
        <div className="grid grid-cols-8 border-b-4 border-white bg-white text-black px-3 py-2 text-xs font-doto font-black uppercase">
          <div>Agent</div>
          <div>Pair</div>
          <div>Side</div>
          <div>Entry</div>
          <div>Lev</div>
          <div>Size ($)</div>
          <div>Status</div>
          <div>AI Reason</div>
        </div>
        <div className="divide-y-2 divide-white">
          {rows.map((p, idx) => (
            <div key={p._id || idx} className="grid grid-cols-8 px-3 py-2 text-sm font-mono">
              <div className="truncate pr-2 text-white">{p.agentName}</div>
              <div className="text-white">{p.coin}/USDT</div>
              <div>
                <span
                  className={
                    "px-2 py-0.5 text-xs font-doto font-black border-2 border-black " +
                    (p.signal === "long"
                      ? "bg-lime-400 text-black"
                      : "bg-white text-black")
                  }
                >
                  {p.signal.toUpperCase()}
                </span>
              </div>
              <div className="text-white">{p.entry_price}</div>
              <div className="text-white">{p.leverage}x</div>
              <div className="text-white">{Math.round(p.size_usd)}</div>
              <div>
                <span className="px-2 py-0.5 text-xs font-doto font-black border-2 border-white bg-black text-white uppercase">
                  {p.status}
                </span>
              </div>
              <div className="truncate text-white/80 text-xs">{p.aiReason || "—"}</div>
            </div>
          ))}
          {rows.length === 0 && !loading && (
            <div className="px-3 py-6 text-center text-sm font-mono text-white/60">No positions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}


