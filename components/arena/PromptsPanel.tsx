"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { AIAgent } from "@/types";
import { fetchAgents } from "@/lib/api-client";

/**
 * PromptsPanel
 * Lets you browse agent prompts and see the current selection's full text.
 */
export default function PromptsPanel() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchAgents();
        if (!mounted) return;
        setAgents(data);
        if (!selectedId && data.length > 0) {
          setSelectedId(data[0].id);
        }
        setLoading(false);
      } catch (_err) {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [selectedId]);

  const selected = useMemo(() => agents.find((a) => a.id === selectedId), [agents, selectedId]);

  return (
    <div className="space-y-4">
      {/* Status indicator */}
      <div className="flex items-center justify-end">
        <div className="text-xs font-mono text-lime-400">{loading ? "loading…" : "synced"}</div>
      </div>

      {/* Agent selector */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border-4 border-white bg-black text-white px-3 py-2 text-sm font-doto font-black uppercase hover:bg-white hover:text-black brutal-hover"
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {selected && (
          <span className="border-2 border-white bg-white text-black px-2 py-1 text-xs font-doto font-black uppercase">
            {selected.strategy}
          </span>
        )}
      </div>

      {/* Prompt display */}
      <div className="border-4 border-white bg-black p-4">
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs font-mono text-white">
{selected?.prompt || "No prompt available."}
        </pre>
      </div>
    </div>
  );
}


