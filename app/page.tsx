"use client";

/**
 * Aster Royale: The AI Arena — Main Dashboard
 * Live showcase of AI trading agents competing on Aster
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { AIAgent, Trade } from "@/types";
import { fetchAgents, fetchLiveUpdates, fetchTrades, fetchBalanceHistory } from "@/lib/api-client";
import { AIAgentCard } from "@/components/arena/AIAgentCard";
import { LiveFeed } from "@/components/arena/LiveFeed";
import { BalanceChart } from "@/components/arena/BalanceChart";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { PriceTicker } from "@/components/arena/PriceTicker";
import { TypingText } from "@/components/ui/TypingText";

export default function ArenaPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
  const hasLoadedHistoricalData = useRef(false);

  // Initialize agents on mount
  useEffect(() => {
    async function loadAgents() {
      try {
        const agentsData = await fetchAgents();
        console.log('Loaded agents:', agentsData.length);
        setAgents(agentsData);
        
        // Load historical balance snapshots - try extended timeframe
        try {
          // Fetch all-time snapshots (API supports all=true)
          const snapshots = await fetchBalanceHistory('all');
          
          if (snapshots.length > 0) {
            // Group snapshots by rounded timestamp (to nearest 5 seconds)
            // This ensures snapshots from the same sync cycle (within 30s) group together
            const SNAP_GROUP_INTERVAL = 5000; // 5 seconds
            const snapshotMap = new Map<number, any>();
            
            // Track unique agent names found in snapshots
            const agentNamesInSnapshots = new Set<string>();
            
            snapshots.forEach((snapshot: any) => {
              const timestamp = snapshot.timestamp;
              const agentName = snapshot.agentName;
              
              // Round timestamp to nearest interval for grouping
              // This ensures snapshots from same sync cycle group together
              const roundedTimestamp = Math.floor(timestamp / SNAP_GROUP_INTERVAL) * SNAP_GROUP_INTERVAL;
              
              // Track which agents we have data for
              if (agentName) {
                agentNamesInSnapshots.add(agentName);
              }
              
              if (!snapshotMap.has(roundedTimestamp)) {
                // Format time for display - show date and time for full timeframe
                const date = new Date(roundedTimestamp);
                const timeStr = date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                snapshotMap.set(roundedTimestamp, { time: timeStr, timestamp: roundedTimestamp });
              }
              
              // Add agent balance to this timestamp entry
              // If multiple snapshots for same agent at same rounded time, use the latest one
              if (agentName) {
                const existing = snapshotMap.get(roundedTimestamp);
                // Only update if this snapshot is newer (or doesn't exist)
                if (!existing[agentName] || timestamp > (existing[`_${agentName}_ts`] || 0)) {
                  existing[agentName] = snapshot.balance;
                  existing[`_${agentName}_ts`] = timestamp; // Track original timestamp for comparison
                }
              }
            });
            
            // Debug: log which agents we found
            console.log(`📊 Found snapshots for agents:`, Array.from(agentNamesInSnapshots));
            
            // Get all agent names from agents data
            const allAgentNames = agentsData.map(a => a.name);
            
            // Convert to array, clean up internal tracking fields, and ensure all agents are in each entry
            const history = Array.from(snapshotMap.values())
              .map((entry, index) => {
                // Remove internal timestamp tracking fields
                const cleaned = { ...entry };
                Object.keys(cleaned).forEach(key => {
                  if (key.startsWith('_')) {
                    delete cleaned[key];
                  }
                });
                
                // Ensure all agents are present in this entry (use previous value if missing)
                allAgentNames.forEach(agentName => {
                  if (!(agentName in cleaned) || cleaned[agentName] === undefined) {
                    // Find the most recent value for this agent from previous entries
                    let foundValue = null;
                    for (let i = index - 1; i >= 0; i--) {
                      const prevEntry = Array.from(snapshotMap.values())[i];
                      if (prevEntry && prevEntry[agentName] !== undefined) {
                        foundValue = prevEntry[agentName];
                        break;
                      }
                    }
                    // If no previous value, use current balance from agent data
                    if (foundValue === null) {
                      const agent = agentsData.find(a => a.name === agentName);
                      foundValue = (agent as any)?.balance ?? 0;
                    }
                    cleaned[agentName] = foundValue;
                  }
                });
                
                return cleaned;
              })
              .sort((a, b) => a.timestamp - b.timestamp);
            
            // Debug: log the time range and agent keys in first/last entries
            if (history.length > 0) {
              const firstTime = new Date(history[0].timestamp).toLocaleString();
              const lastTime = new Date(history[history.length - 1].timestamp).toLocaleString();
              const firstEntryKeys = Object.keys(history[0]).filter(k => k !== 'time' && k !== 'timestamp');
              const lastEntryKeys = Object.keys(history[history.length - 1]).filter(k => k !== 'time' && k !== 'timestamp');
              console.log(`📊 Loaded ${history.length} data points | Range: ${firstTime} to ${lastTime}`);
              console.log(`📊 First entry has agents: ${firstEntryKeys.join(', ')}`);
              console.log(`📊 Last entry has agents: ${lastEntryKeys.join(', ')}`);
              console.log(`📊 All agents should be: ${allAgentNames.join(', ')}`);
            }
            
            // Downsample to avoid rendering too many points
            const MAX_POINTS = 600;
            const sampled = history.length > MAX_POINTS
              ? history.filter((_, idx) => idx % Math.ceil(history.length / MAX_POINTS) === 0)
              : history;

            setBalanceHistory(sampled);
            hasLoadedHistoricalData.current = true;
          } else {
            // No snapshots available (e.g., system idle for days). Create a synthetic flat line
            // over the last 7 days using current balances so the chart still renders.
            const points = 48; // 7 days sampled every 3.5 hours roughly
            const now = Date.now();
            const spanMs = 7 * 24 * 60 * 60 * 1000;
            const step = Math.floor(spanMs / points);
            const synthetic: any[] = [];
            for (let i = points - 1; i >= 0; i--) {
              const ts = now - i * step;
              const date = new Date(ts);
              const timeStr = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const row: any = { time: timeStr, timestamp: ts };
              agentsData.forEach(agent => {
                // Use actual balance from database (synced from exchange)
                // If balance is 0 or undefined, use 0 (not hardcoded 1000)
                row[agent.name] = (agent as any).balance ?? 0;
              });
              synthetic.push(row);
            }
            setBalanceHistory(synthetic);
            hasLoadedHistoricalData.current = true;
          }
        } catch (error) {
          console.error('Failed to load balance history:', error);
          // Fallback: initialize with current balances
          const now = Date.now();
          const date = new Date(now);
          const timeStr = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          const initialHistory: any = {
            time: timeStr,
            timestamp: now,
          };
          agentsData.forEach(agent => {
            // Use actual balance from database (synced from exchange)
            // If balance is 0 or undefined, use 0 (not hardcoded 1000)
            initialHistory[agent.name] = (agent as any).balance ?? 0;
          });
          // Build a short synthetic flat line (past 1 hour)
          const synthetic: any[] = [];
          for (let i = 12; i >= 0; i--) {
            const ts = now - i * 5 * 60 * 1000; // every 5 minutes
            const d = new Date(ts);
            const t = d.toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            synthetic.push({ ...initialHistory, time: t, timestamp: ts });
          }
          setBalanceHistory(synthetic);
          hasLoadedHistoricalData.current = true;
        }
        
        // Fetch initial trades (now shows both entry and exit trades)
        const tradesData = await fetchTrades(30);
        setRecentTrades(tradesData);
      } catch (error) {
        console.error('Failed to load agents:', error);
      }
    }
    loadAgents();
  }, []);

  // Fetch fresh balance snapshots periodically
  useEffect(() => {
    if (!hasLoadedHistoricalData.current) return;

    // Function to fetch and merge latest snapshots
    const refreshBalanceHistory = async () => {
      try {
        // Fetch a small recent window and merge
        const snapshots = await fetchBalanceHistory(0.01); // ~36 seconds
        if (snapshots.length === 0) return;

        // Group by rounded timestamp (same logic as initial load)
        const SNAP_GROUP_INTERVAL = 5000; // 5 seconds
        const snapshotMap = new Map<number, any>();
        
        snapshots.forEach((snapshot: any) => {
          const timestamp = snapshot.timestamp;
          const agentName = snapshot.agentName;
          
          // Round timestamp to nearest interval (same as initial load)
          const roundedTimestamp = Math.floor(timestamp / SNAP_GROUP_INTERVAL) * SNAP_GROUP_INTERVAL;
          
          if (!snapshotMap.has(roundedTimestamp)) {
            const date = new Date(roundedTimestamp);
            const timeStr = date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            snapshotMap.set(roundedTimestamp, { time: timeStr, timestamp: roundedTimestamp });
          }
          
          // Add agent balance (use latest if multiple snapshots for same agent)
          if (agentName) {
            const existing = snapshotMap.get(roundedTimestamp);
            if (!existing[agentName] || timestamp > (existing[`_${agentName}_ts`] || 0)) {
              existing[agentName] = snapshot.balance;
              existing[`_${agentName}_ts`] = timestamp;
            }
          }
        });

        // Get all agent names from current agents state
        const allAgentNames = agents.map(a => a.name);
        
        // Clean up internal tracking fields, ensure all agents present, and sort
        const newPoints = Array.from(snapshotMap.values())
          .map((entry, index) => {
            const cleaned = { ...entry };
            Object.keys(cleaned).forEach(key => {
              if (key.startsWith('_')) {
                delete cleaned[key];
              }
            });
            
            // Ensure all agents are present (use current balance if missing)
            allAgentNames.forEach(agentName => {
              if (!(agentName in cleaned) || cleaned[agentName] === undefined) {
                const agent = agents.find(a => a.name === agentName);
                cleaned[agentName] = (agent as any)?.balance ?? 0;
              }
            });
            
            return cleaned;
          })
          .sort((a, b) => a.timestamp - b.timestamp);
        
        setBalanceHistory(prev => {
          // Create a map of existing entries by rounded timestamp
          const SNAP_GROUP_INTERVAL = 5000;
          const existingMap = new Map<number, any>();
          prev.forEach(entry => {
            const roundedTs = Math.floor((entry.timestamp || 0) / SNAP_GROUP_INTERVAL) * SNAP_GROUP_INTERVAL;
            if (!existingMap.has(roundedTs)) {
              existingMap.set(roundedTs, { ...entry, timestamp: roundedTs });
            } else {
              // Merge agents from this entry into existing
              const existing = existingMap.get(roundedTs);
              Object.keys(entry).forEach(key => {
                if (key !== 'time' && key !== 'timestamp') {
                  existing[key] = entry[key];
                }
              });
            }
          });
          
          // Merge new points into existing map
          newPoints.forEach(newPoint => {
            const roundedTs = newPoint.timestamp;
            if (!existingMap.has(roundedTs)) {
              existingMap.set(roundedTs, newPoint);
            } else {
              // Merge agents from new point into existing
              const existing = existingMap.get(roundedTs);
              Object.keys(newPoint).forEach(key => {
                if (key !== 'time' && key !== 'timestamp') {
                  existing[key] = newPoint[key];
                }
              });
            }
          });
          
          // Get all agent names
          const allAgentNames = agents.map(a => a.name);
          
          // Convert to array, ensure all agents present, and sort
          const merged = Array.from(existingMap.values())
            .map(entry => {
              // Ensure all agents are present in each entry
              allAgentNames.forEach(agentName => {
                if (!(agentName in entry) || entry[agentName] === undefined) {
                  const agent = agents.find(a => a.name === agentName);
                  entry[agentName] = (agent as any)?.balance ?? 0;
                }
              });
              return entry;
            })
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          
          // Downsample to cap points for performance
          const MAX_POINTS = 800;
          const step = Math.ceil(merged.length / MAX_POINTS);
          const sampled = step > 1 ? merged.filter((_, idx) => idx % step === 0) : merged;
          return sampled;
        });
      } catch (error) {
        console.error('Error refreshing balance history:', error);
      }
    };

    // Refresh every 2 seconds to stay in sync with snapshot saving (which happens every 1 second)
    const interval = setInterval(refreshBalanceHistory, 2000);
    
    // Initial refresh after a short delay
    const timeout = setTimeout(refreshBalanceHistory, 1000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [hasLoadedHistoricalData.current]);

  // Fetch live trading data from backend
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(async () => {
      try {
        const result = await fetchLiveUpdates();
        setAgents(result.agents);
        
        // Fetch recent trades (now shows both entry and exit trades)
        const tradesData = await fetchTrades(30);
        setRecentTrades(tradesData);
      } catch (error) {
        console.error("Error fetching live data:", error);
      }
    }, 5000); // Update every 5 seconds (trading worker runs every 30s)

    return () => clearInterval(interval);
  }, [isLive]);

  // Sort agents by PnL
  const sortedAgents = [...agents].sort((a, b) => b.pnl - a.pnl);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden brutal-bg">
      {/* Scanline effect for retro feel */}
      <div className="scanline fixed inset-0 pointer-events-none z-50 overflow-hidden" />
      
      {/* Price Ticker - Top of page */}
      <div className="sticky top-0 z-40 bg-black border-b-4 border-white">
        <PriceTicker />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header - Brutal and bold */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12 text-center relative"
        >
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="NEURAL//ORDER Logo"
              className="h-16 md:h-20 w-auto border-4 border-white bg-white p-2 brutal-hover"
            />
          </div>
          
          {/* Decorative lines with glow */}
          <div className="hidden md:block absolute top-1/2 left-4 transform -translate-y-1/2 w-16 h-1 bg-lime-400 shadow-[0_0_8px_rgba(16,255,0,0.6)]"></div>
          <div className="hidden md:block absolute top-1/2 right-4 transform -translate-y-1/2 w-16 h-1 bg-lime-400 shadow-[0_0_8px_rgba(16,255,0,0.6)]"></div>
          
          <h1 className="text-6xl md:text-8xl font-doto font-black text-white uppercase tracking-wider mb-6 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] relative z-10">
            NEURAL//ORDER
          </h1>
          
          {/* ASCII decorative elements */}
          <div className="flex justify-center gap-8 mb-6 text-sm font-mono text-lime-400 pulse-glow">
            <span>{'< >'}</span>
            <span className="hidden md:inline">{'[ ]'}</span>
            <span className="hidden lg:inline">{'# #'}</span>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="bg-black border-4 border-white px-6 py-3 brutal-hover cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 ${isLive ? 'status-dot-live' : 'status-dot-inactive'} status-dot pixel-pulse`} />
                <span className="text-sm font-doto uppercase font-black tracking-wider">{isLive ? "LIVE" : "OFFLINE"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Balance Chart - Full width */}
        {balanceHistory.length > 1 && (
          <div className="mb-8">
            <BalanceChart 
              balanceHistory={balanceHistory} 
              agents={agents.map(a => ({ name: a.name, logo: a.logo, avatar: a.avatar }))}
            />
          </div>
        )}
        
        {/* Arena Stats - Grid layout with hard borders */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black border-4 border-white mb-8 p-6 relative terminal-corner"
        >
          {/* ASCII header with glow */}
          <div className="absolute top-2 left-2 text-xs font-mono text-lime-400 pulse-glow">┌─ STATS ─┐</div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="border-4 border-white bg-white text-black p-4 brutal-hover relative group">
              <div className="absolute top-2 left-2 text-xs font-mono text-lime-400">{'>'}</div>
              <div className="absolute top-2 right-2 text-xs font-mono opacity-20">#</div>
              <div className="text-xs font-doto uppercase mb-3 tracking-wider">Volume 24h</div>
              <div className="text-3xl md:text-4xl font-black font-doto counter-text">
                $<AnimatedNumber 
                  value={agents.reduce((sum, a) => sum + (a.volume24h || 0), 0) / 1000000} 
                  format="currency"
                  decimals={2}
                />M
              </div>
            </div>
            <div className="border-4 border-white bg-black text-white p-4 brutal-hover relative group">
              <div className="absolute top-2 left-2 text-xs font-mono text-lime-400">{'>'}</div>
              <div className="absolute top-2 right-2 text-xs font-mono opacity-20">#</div>
              <div className="text-xs font-doto uppercase mb-3 tracking-wider">Total Trades</div>
              <div className="text-3xl md:text-4xl font-black font-doto counter-text">
                <AnimatedNumber 
                  value={agents.reduce((sum, a) => sum + (a.totalTrades || 0), 0)} 
                  format="count"
                  decimals={0}
                />
              </div>
            </div>
            <div className="border-4 border-white bg-white text-black p-4 brutal-hover relative group">
              <div className="absolute top-2 left-2 text-xs font-mono text-lime-400">{'>'}</div>
              <div className="absolute top-2 right-2 text-xs font-mono opacity-20">#</div>
              <div className="text-xs font-doto uppercase mb-3 tracking-wider">Profitable</div>
              <div className="text-3xl md:text-4xl font-black font-doto counter-text">
                <AnimatedNumber 
                  value={agents.filter((a) => a.pnl > 0).length} 
                  format="count"
                  decimals={0}
                />/{agents.length}
              </div>
            </div>
            <div className="border-4 border-white bg-black text-white p-4 brutal-hover relative group">
              <div className="absolute top-2 left-2 text-xs font-mono text-lime-400">{'>'}</div>
              <div className="absolute top-2 right-2 text-xs font-mono opacity-20">#</div>
              <div className="text-xs font-doto uppercase mb-3 tracking-wider">Live Agents</div>
              <div className="text-3xl md:text-4xl font-black font-doto counter-text">
                <AnimatedNumber 
                  value={agents.filter((a) => a.status === 'active').length} 
                  format="count"
                  decimals={0}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content - Brutal Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8 items-stretch">
          {/* Leaderboard */}
          <div className="xl:col-span-2 flex">
            <div className="bg-black border-4 border-white p-6 relative terminal-corner h-full w-full flex flex-col">
              <div className="absolute top-2 left-2 text-xs font-mono text-lime-400 pulse-glow">┌─ AGENTS ─┐</div>
              <h2 className="text-xl md:text-2xl font-doto font-black uppercase mb-6 tracking-wider">
                <TypingText text="AI AGENT LEADERBOARD" />
              </h2>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {sortedAgents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm font-doto uppercase">Initializing agents...</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <div className="w-2 h-2 bg-white pixel-pulse" />
                      <div className="w-2 h-2 bg-white pixel-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-white pixel-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                ) : (
                  sortedAgents.map((agent, index) => (
                    <AIAgentCard
                      key={agent.id}
                      agent={agent}
                      rank={index + 1}
                      onClick={() => router.push(`/agent/${agent.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Live Feed */}
          <div className="xl:col-span-1 flex">
            <LiveFeed trades={recentTrades} maxVisible={12} agents={agents} />
          </div>
        </div>
      </div>
    </main>
  );
}

