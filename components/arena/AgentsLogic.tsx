"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { AIAgent } from "@/types";
import { fetchAgents } from "@/lib/api-client";

/**
 * AgentsLogic
 * Shows each agent's strategy, current AI thought, status, and recent decisions.
 * We poll the backend every few seconds to keep content feeling live.
 */
export default function AgentsLogic() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchAgents();
        if (!mounted) return;
        setAgents(data);
        setLoading(false);
      } catch (_err) {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    const id = setInterval(load, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0));
  }, [agents]);

  return (
    <div className="space-y-3">
      {/* Status indicator */}
      <div className="mb-4 flex items-center justify-between">
        {loading ? (
          <span className="text-xs font-mono text-lime-400">loading…</span>
        ) : (
          <span className="text-xs font-mono text-lime-400">{sortedAgents.length} active</span>
        )}
      </div>
        {sortedAgents.map((agent) => {
          const isOpen = expanded[agent.id];
          const recent = (agent.decisionHistory || []).slice(-3).reverse();
          return (
            <div
              key={agent.id}
              className="border-4 border-white bg-black p-3 brutal-hover"
            >
              <div className="flex items-start gap-3">
                {/* Avatar or Logo */}
                {agent.logo ? (
                  <div className="w-10 h-10 border-2 border-white bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={agent.logo}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 border-2 border-white bg-white text-black flex items-center justify-center font-doto text-lg">
                    {agent.avatar || "AI"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate pr-3">
                      <div className="truncate text-sm font-medium">{agent.name}</div>
                      <div className="truncate text-xs text-white/60">{agent.strategy}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "px-2 py-1 text-xs font-doto font-black border-2 " +
                          (agent.pnl >= 0
                            ? "bg-lime-400 text-black border-black"
                            : "bg-white text-black border-black")
                        }
                      >
                        {agent.pnl?.toFixed(2)}%
                      </span>
                      <button
                        className="px-2 py-1 text-xs font-doto uppercase font-black border-2 border-white bg-black text-white hover:bg-white hover:text-black brutal-hover"
                        onClick={() =>
                          setExpanded((prev) => ({ ...prev, [agent.id]: !isOpen }))
                        }
                      >
                        {isOpen ? "HIDE" : "DETAILS"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-mono text-white/80">
                    {agent.aiThought || "No recent thought available."}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t-4 border-white pt-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-lime-400">
                    Recent decisions
                  </div>
                  {recent.length === 0 && (
                    <div className="text-xs font-mono text-white/60">No decisions logged.</div>
                  )}
                  {recent.map((d, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-white bg-black p-2"
                    >
                      <div className="mb-1 flex items-center justify-between text-[11px] font-mono text-lime-400">
                        <span>{new Date(d.timestamp).toLocaleTimeString()}</span>
                        <span className="px-1.5 py-0.5 border border-white bg-white text-black font-doto font-black text-[10px]">
                          {d.action || "action"}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-white/80 line-clamp-3">
                        {d.reasoning || d.prompt || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}


