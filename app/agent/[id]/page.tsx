"use client";

/**
 * AI Agent Detail Page
 * Shows comprehensive stats, trade history, and performance for individual agents
 */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { AIAgent, Trade } from "@/types";
import { fetchAgents, fetchTrades, fetchPositions } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [closedPositions, setClosedPositions] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and find agent
  useEffect(() => {
    async function loadAgent() {
      setIsLoading(true);
      try {
        const agentsData = await fetchAgents();
        setAgents(agentsData);
        const foundAgent = agentsData.find((a) => a.id === agentId);
        setAgent(foundAgent || null);
      
      // Debug: Check agent aiThought
      if (foundAgent) {
        console.log('Agent aiThought:', foundAgent.aiThought);
      }

      // Load trade history for this agent
      const tradesData = await fetchTrades(50, agentId);
      setTradeHistory(tradesData);
      
      // Debug: Log first trade to check for aiReason
      if (tradesData.length > 0) {
        console.log('Sample trade data:', tradesData[0]);
        console.log('Has aiReason:', !!tradesData[0].aiReason);
      }
      
      // Load positions (open and closed)
      const [openPos, closedPos] = await Promise.all([
        fetchPositions(100, agentId, "open"),
        fetchPositions(100, agentId, "closed")
      ]);
      setOpenPositions(openPos);
      setClosedPositions(closedPos.slice(0, 20)); // Only show recent 20 closed positions
      
      // Debug: Log first position
      if (openPos.length > 0) {
        console.log('Sample open position:', openPos[0]);
        console.log('Has aiReason:', !!openPos[0].aiReason);
      }
      } catch (error) {
        console.error('Error loading agent:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAgent();
  }, [agentId]);

  // Live updates
  useEffect(() => {
    if (!isLive || !agent) return;

    const interval = setInterval(async () => {
      try {
        const agentsData = await fetchAgents();
        setAgents(agentsData);
        const updatedAgent = agentsData.find((a) => a.id === agentId);
        if (updatedAgent) {
          setAgent(updatedAgent);
        }

        const tradesData = await fetchTrades(50, agentId);
        setTradeHistory(tradesData);
        
        // Update positions
        const [openPos, closedPos] = await Promise.all([
          fetchPositions(100, agentId, "open"),
          fetchPositions(100, agentId, "closed")
        ]);
        setOpenPositions(openPos);
        setClosedPositions(closedPos.slice(0, 20));
      } catch (error) {
        console.error("Error updating agent:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, agent, agentId]);

  // Show loading state while fetching
  if (isLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center border-4 border-white p-8 bg-white text-black">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-4 h-4 bg-black pixel-pulse" />
            <div className="w-4 h-4 bg-black pixel-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-4 h-4 bg-black pixel-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <h1 className="text-2xl font-mono font-black uppercase">Loading Agent...</h1>
        </div>
      </main>
    );
  }

  // Show not found only after loading is complete
  if (!agent) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center border-4 border-white p-8 bg-white text-black">
          <h1 className="text-2xl font-mono font-black uppercase mb-4">Agent Not Found</h1>
          <button
            onClick={() => router.push("/")}
            className="border-4 border-black bg-white text-black px-4 py-2 font-mono font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
          >
            Back
          </button>
        </div>
      </main>
    );
  }

  const isProfitable = agent.pnl > 0;
  const pnlColor = isProfitable ? "text-lime-400" : "text-red-500";

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Scanline effect for retro feel */}
      <div className="scanline fixed inset-0 pointer-events-none z-50" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push("/")}
            className="border-4 border-white bg-white text-black px-4 py-2 font-mono font-black uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </motion.div>

        {/* Agent Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border-4 border-white p-6 mb-6"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar or Logo */}
              {agent.logo ? (
                <div className="w-24 h-24 border-4 border-white overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={agent.logo}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 border-4 border-white bg-white text-black text-6xl flex items-center justify-center font-black">
                  {agent.avatar}
                </div>
              )}
              
              {/* Name & Strategy */}
              <div>
                <h1 className="text-2xl md:text-4xl font-mono font-black uppercase mb-2">{agent.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="border-2 border-white bg-black text-white px-3 py-1 font-mono text-xs uppercase">
                    {agent.strategy}
                  </div>
                  <div className="border-2 border-white bg-white text-black px-3 py-1 font-mono text-xs uppercase">
                    {agent.status}
                  </div>
                  {agent.twitter && (
                    <a
                      href={agent.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-white bg-black text-white px-3 py-1 font-mono text-xs uppercase hover:bg-white hover:text-black brutal-hover"
                    >
                      X / Twitter
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Main PnL */}
            <div className="text-right">
              <div className={`text-3xl md:text-5xl font-mono font-black ${pnlColor}`}>
                {isProfitable ? "+" : ""}
                {formatNumber(agent.pnl, 1)}%
              </div>
              <div className="text-xs font-mono uppercase mt-1">
                ${formatNumber(Math.abs(agent.pnlAbsolute), 0)}
              </div>
            </div>
          </div>

          {/* AI Thought - Always Visible */}
          <div className="mt-4 border-t-4 border-white pt-4">
            <div className="border-4 border-white bg-white text-black p-4">
              <div className="text-xs font-mono font-black uppercase mb-2">AI Thought</div>
              <p className="text-sm font-mono">
                {agent.aiThought || "Waiting for AI to analyze market..."}
              </p>
            </div>
          </div>

          {/* AI Decision History - New Section */}
          {agent.decisionHistory && agent.decisionHistory.length > 0 && (
            <div className="mt-4 border-t-4 border-white pt-4">
              <div className="flex items-center justify-between mb-3 border-b-4 border-white pb-2">
                <h3 className="text-base md:text-lg font-mono font-black uppercase">Decision History</h3>
                <span className="text-xs font-mono uppercase">{agent.decisionHistory.length}</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {agent.decisionHistory.slice(-10).reverse().map((decision: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-2 border-white p-3 bg-black"
                  >
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <div className="font-mono uppercase">
                        {new Date(decision.timestamp).toLocaleString()}
                      </div>
                      <div className={`border-2 px-2 py-1 font-mono font-black ${
                        decision.action === 'open' ? 'border-lime-400 text-lime-400' :
                        decision.action === 'close' ? 'border-red-500 text-red-500' :
                        'border-gray-500 text-gray-500'
                      }`}>
                        {decision.action.toUpperCase()}
                      </div>
                    </div>
                    {decision.reasoning && (
                      <p className="text-xs font-mono">{decision.reasoning}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {/* Win Rate */}
          <div className="border-4 border-white bg-white text-black p-4">
            <div className="text-xs font-mono uppercase mb-2">Win Rate</div>
            <div className="text-2xl md:text-3xl font-mono font-black">
              {formatNumber(agent.winRate, 1)}%
            </div>
            <div className="mt-2 text-xs font-mono uppercase">
              {agent.totalTrades} trades
            </div>
          </div>

          {/* Volume */}
          <div className="border-4 border-white bg-black text-white p-4">
            <div className="text-xs font-mono uppercase mb-2">24h Volume</div>
            <div className="text-2xl md:text-3xl font-mono font-black">
              ${formatNumber(agent.volume24h / 1000, 0)}k
            </div>
            <div className="mt-2 text-xs font-mono uppercase">
              Simulated
            </div>
          </div>

          {/* Total Trades */}
          <div className="border-4 border-white bg-white text-black p-4">
            <div className="text-xs font-mono uppercase mb-2">Total Trades</div>
            <div className="text-2xl md:text-3xl font-mono font-black">
              {agent.totalTrades}
            </div>
            <div className="mt-2 text-xs font-mono uppercase">
              Lifetime
            </div>
          </div>

          {/* Status */}
          <div className="border-4 border-white bg-black text-white p-4">
            <div className="text-xs font-mono uppercase mb-2">Status</div>
            <div className="text-2xl md:text-3xl font-mono font-black uppercase">
              {agent.status}
            </div>
            <div className="mt-2 text-xs font-mono uppercase">
              Real-time
            </div>
          </div>
        </div>

        {/* Trade History */}
        <div className="bg-black border-4 border-white p-4 mb-6">
          <div className="flex items-center justify-between mb-4 border-b-4 border-white pb-2">
            <h2 className="text-xl md:text-2xl font-mono font-black uppercase">Recent Trades</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${isLive ? "bg-lime-400 pixel-pulse" : "bg-gray-500"}`} />
              <span className="text-xs font-mono uppercase font-black">{isLive ? "LIVE" : "OFF"}</span>
            </div>
          </div>

          {tradeHistory.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tradeHistory.map((trade: any, index: number) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-2 p-3 ${
                    trade.pnl > 0
                      ? "border-lime-400 bg-lime-400/10"
                      : "border-red-500 bg-red-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex-1">
                      <div className="font-mono font-black uppercase mb-1">
                        {trade.side} {trade.pair}
                      </div>
                      <div className="font-mono text-xs opacity-75 mb-1">
                        {new Date(trade.timestamp).toLocaleString()}
                      </div>
                      <div className="font-mono text-xs">
                        {formatNumber(trade.amount, 2)} @ ${formatNumber(trade.price, 0)}
                        {trade.leverage && ` • ${trade.leverage}x`}
                      </div>
                      {trade.aiReason && (
                        <div className="mt-2 pt-2 border-t-2 border-white/20">
                          <div className="text-xs font-mono uppercase tracking-wide text-lime-400 mb-1">AI REASON</div>
                          <div className="text-xs font-mono opacity-80">{trade.aiReason}</div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-mono font-black ${trade.pnl > 0 ? "text-lime-400" : "text-red-500"}`}>
                        {trade.pnl > 0 ? "+" : ""}{formatNumber(trade.pnl, 1)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-2xl mb-2 font-mono">==</div>
              <p className="text-xs font-mono uppercase">No trades</p>
            </div>
          )}
        </div>

        {/* Open Positions */}
        <div className="bg-black border-4 border-white p-4 mb-6">
          <div className="flex items-center justify-between mb-4 border-b-4 border-white pb-2">
            <h2 className="text-xl md:text-2xl font-mono font-black uppercase">Open Positions</h2>
            <span className="text-xs font-mono uppercase font-black">
              {openPositions.length} Active
            </span>
          </div>

          {openPositions.length > 0 ? (
            <div className="space-y-2">
              {openPositions.map((position: any, index: number) => (
                <div
                  key={position._id || index}
                  className="border-2 border-white bg-black p-3"
                >
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {/* Position Info - Entry & Current Price */}
                    <div>
                      <div className="font-mono font-black uppercase mb-1">
                        {position.signal} {position.coin}
                      </div>
                      <div className="font-mono text-xs opacity-75">
                        Entry: ${formatNumber(position.entry_price, 2)}
                      </div>
                      <div className={`font-mono text-xs ${position.current_price ? (position.price_change >= 0 ? 'text-lime-400' : 'text-red-400') : 'opacity-75'}`}>
                        Now: ${formatNumber(position.current_price || position.entry_price, 2)}
                      </div>
                      <div className={`font-mono text-xs font-black ${position.price_change >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                        {position.price_change >= 0 ? '+' : ''}{formatNumber(position.price_change || 0, 2)}%
                      </div>
                    </div>
                    
                    {/* PnL Details */}
                    <div className="border-2 border-white bg-black text-white p-2">
                      <div className="font-mono text-xs uppercase mb-1">Unrealized PnL</div>
                      <div className={`font-mono font-black ${position.pnl >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                        {position.pnl >= 0 ? '+' : ''}{formatNumber(position.pnl || 0, 2)}%
                      </div>
                      <div className={`font-mono text-xs ${position.pnlAbsolute >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                        ${position.pnlAbsolute >= 0 ? '+' : ''}${formatNumber(position.pnlAbsolute || 0, 2)}
                      </div>
                    </div>
                    
                    {/* Size & Leverage */}
                    <div className="border-2 border-white bg-white text-black p-2">
                      <div className="font-mono text-xs uppercase mb-1">Size</div>
                      <div className="font-mono font-black">${formatNumber(position.size_usd, 0)}</div>
                      <div className="font-mono text-xs mt-1">{position.leverage}x Leverage</div>
                    </div>
                    
                    {/* Take Profit & Stop Loss */}
                    <div>
                      <div className="font-mono text-xs uppercase mb-1">Target</div>
                      <div className="font-mono text-lime-400 font-black">${formatNumber(position.profit_target, 2)}</div>
                      <div className="font-mono text-xs mt-1 text-red-400">Stop: ${formatNumber(position.stop_loss, 2)}</div>
                    </div>
                  </div>
                  {position.aiReason && (
                    <div className="mt-3 pt-3 border-t-2 border-white">
                      <div className="text-xs font-mono uppercase tracking-wide text-lime-400 mb-1">AI REASON</div>
                      <div className="text-xs font-mono opacity-80">{position.aiReason}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-2xl mb-2 font-mono">==</div>
              <p className="text-xs font-mono uppercase">No open positions</p>
            </div>
          )}
        </div>

        {/* Closed Positions History */}
        <div className="bg-black border-4 border-white p-4">
          <div className="flex items-center justify-between mb-4 border-b-4 border-white pb-2">
            <h2 className="text-xl md:text-2xl font-mono font-black uppercase">Closed Positions</h2>
            <span className="text-xs font-mono uppercase font-black">Last 20</span>
          </div>

          {closedPositions.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {closedPositions.map((position: any, index: number) => {
                const isProfitable = position.pnl > 0;
                
                return (
                  <div
                    key={position._id || index}
                    className={`border-2 p-3 ${
                      isProfitable
                        ? "border-lime-400 bg-lime-400/10"
                        : "border-red-500 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`border-2 px-2 py-1 font-mono font-black ${
                          position.signal === "long"
                            ? "border-lime-400 text-lime-400"
                            : "border-red-500 text-red-500"
                        }`}>
                          {position.signal}
                        </div>
                        <div>
                          <div className="font-mono font-black uppercase">{position.coin}</div>
                          <div className="font-mono text-xs opacity-75">
                            {new Date(position.opened_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-mono font-black ${isProfitable ? "text-lime-400" : "text-red-500"}`}>
                          {isProfitable ? "+" : ""}{formatNumber(position.pnl, 1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-2xl mb-2 font-mono">==</div>
              <p className="text-xs font-mono uppercase">No closed positions</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

