"use client";

/**
 * Live Trades Feed Component
 * Displays scrolling real-time trade updates for all AI agents
 * Shows both entry (when AI opens a position) and exit (when AI closes a position) trades
 * Enhanced with detailed data display and animated descriptions
 */

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trade, AIAgent } from "@/types";
import { formatNumber } from "@/lib/utils";
import { TypingText } from "@/components/ui/TypingText";

interface LiveFeedProps {
  trades: Trade[];
  maxVisible: number;
  agents: AIAgent[]; // Add agents prop to access logos
}

// Extended Trade interface to handle database fields
interface ExtendedTrade extends Trade {
  tradeType?: "entry" | "exit";
  leverage?: number;
  size_usd?: number;
  aiReason?: string;
  orderType?: string;
  confidence?: number;
  takeProfit?: number;  // Take profit price
  stopLoss?: number;    // Stop loss price
}

// Format timestamp to relative time
function formatTime(timestamp: number): string {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// Typing animation component for descriptions
function AnimatedDescription({ text, isActive }: { text: string; isActive: boolean }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    if (!isActive || !text) {
      setDisplayedText("");
      return;
    }
    
    // Reset and animate typing
    setDisplayedText("");
    let currentIndex = 0;
    
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, 30); // Typing speed
    
    return () => clearInterval(timer);
  }, [text, isActive]);
  
  if (!isActive && !text) return null;
  
  return (
    <div className="text-xs font-doto tracking-wide text-lime-400 mt-2 opacity-90">
      {isActive ? displayedText : text}
      {isActive && displayedText.length < text.length && (
        <span className="animate-pulse">▊</span>
      )}
    </div>
  );
}

export function LiveFeed({ trades, maxVisible, agents }: LiveFeedProps) {
  const [visibleTrades, setVisibleTrades] = useState<ExtendedTrade[]>([]);
  const [typingTradeId, setTypingTradeId] = useState<string | null>(null);
  const previousTradesLength = useRef(0);

  // Create a map of agent name to agent data
  const agentMap = useMemo(() => {
    const map = new Map<string, AIAgent>();
    agents.forEach(agent => {
      map.set(agent.name, agent);
    });
    return map;
  }, [agents]);

  useEffect(() => {
    // Show only the latest trades
    const latestTrades = trades.slice(0, maxVisible) as ExtendedTrade[];
    
    // Check if there's a new trade added
    if (latestTrades.length > previousTradesLength.current) {
      // New trade detected - set it as typing
      if (latestTrades.length > 0) {
        setTypingTradeId(latestTrades[0].id);
        // Clear typing state after animation completes
        setTimeout(() => {
          setTypingTradeId(null);
        }, 3000);
      }
    }
    
    previousTradesLength.current = latestTrades.length;
    setVisibleTrades(latestTrades);
  }, [trades, maxVisible]);

  // Calculate active agents in this batch
  const uniqueAgents = new Set(visibleTrades.map(t => t.agentName));
  
  // Get agent logo or avatar by name
  function getAgentLogo(agentName: string) {
    const agent = agentMap.get(agentName);
    return agent?.logo || null;
  }
  
  return (
    <div className="bg-black border-4 border-white p-6 relative terminal-corner h-full w-full flex flex-col">
      <div className="absolute top-2 left-2 text-xs font-mono text-lime-400 pulse-glow">┌─ FEED ─┐</div>
      <div className="flex items-center justify-between mb-4 pb-4 border-b-4 border-white">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-lime-400 pixel-pulse border-2 border-white shadow-[0_0_12px_rgba(16,255,0,0.8)]" />
          <h3 className="text-base md:text-lg font-doto font-black uppercase tracking-wider">
            <TypingText text="Live Feed" />
          </h3>
        </div>
        <div className="text-xs font-doto uppercase tracking-wide border-4 border-white bg-white text-black px-3 py-1">
          {visibleTrades.length} • {uniqueAgents.size}
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {visibleTrades.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3 font-doto">==</div>
            <p className="text-xs font-doto uppercase tracking-wide">Waiting...</p>
          </div>
        ) : (
        <AnimatePresence>
          {visibleTrades.map((trade: ExtendedTrade) => {
            const isEntry = trade.tradeType === "entry";
            const isExit = trade.tradeType === "exit";
            const borderClass = isEntry 
              ? "border-lime-400 bg-lime-400/10" 
              : isExit && trade.pnl > 0
              ? "border-lime-400 bg-lime-400/10"
              : "border-red-500 bg-red-500/10";
            
            const isTyping = typingTradeId === trade.id;
            
            return (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`border-4 ${borderClass} p-3 brutal-hover`}
            >
              {/* Header: Agent and Trade Type */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 flex-1">
                  {/* Agent Logo */}
                  <div className="w-10 h-10 border-4 border-white bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                    {getAgentLogo(trade.agentName) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getAgentLogo(trade.agentName)!}
                        alt={trade.agentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs font-doto font-black">AI</div>
                    )}
                  </div>
                  
                  {/* Agent Name and Strategy Type */}
                  <div className="flex-1 min-w-0">
                    <div className="font-doto font-black uppercase tracking-wide text-sm mb-1">
                      {trade.agentName}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`border-2 px-2 py-0.5 text-xs font-doto font-black uppercase ${
                        isEntry ? "border-lime-400 text-lime-400" : 
                        isExit && trade.pnl > 0 ? "border-lime-400 text-lime-400" : 
                        "border-red-500 text-red-500"
                      }`}>
                        {isEntry ? "ENTRY" : isExit ? "EXIT" : "TRADE"}
                      </div>
                      <div className="border-2 border-white bg-white text-black px-2 py-0.5 text-xs font-doto font-black uppercase">
                        {trade.side.toUpperCase()} {trade.pair}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right side: Price and Time */}
                <div className="text-right font-doto">
                  <div className="font-black counter-text text-lg">${formatNumber(trade.price, 2)}</div>
                  <div className="text-xs opacity-70 font-black uppercase">Entry Price</div>
                  <div className="text-xs opacity-70 mt-1">{formatTime(trade.timestamp)}</div>
                </div>
              </div>

              {/* Trade Details Grid */}
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                {/* Entry Price - Only for Entry Trades */}
                {isEntry && (
                  <div className="border-2 border-lime-400 bg-lime-400/10 text-lime-400 px-2 py-1">
                    <div className="font-doto uppercase text-xs opacity-90">Entry Price</div>
                    <div className="font-doto font-black">${formatNumber(trade.price, 2)}</div>
                  </div>
                )}
                {trade.leverage && (
                  <div className="border-2 border-white bg-black text-white px-2 py-1">
                    <div className="font-doto uppercase text-xs opacity-70">Leverage</div>
                    <div className="font-doto font-black">{trade.leverage}x</div>
                  </div>
                )}
                {trade.size_usd && (
                  <div className="border-2 border-white bg-black text-white px-2 py-1">
                    <div className="font-doto uppercase text-xs opacity-70">Size (Notional)</div>
                    <div className="font-doto font-black">${formatNumber(trade.size_usd, 0)}</div>
                  </div>
                )}
                {trade.orderType && (
                  <div className="border-2 border-white bg-white text-black px-2 py-1">
                    <div className="font-doto uppercase text-xs">Order</div>
                    <div className="font-doto font-black uppercase">{trade.orderType}</div>
                  </div>
                )}
                {trade.confidence && (
                  <div className="border-2 border-white bg-white text-black px-2 py-1">
                    <div className="font-doto uppercase text-xs">Confidence</div>
                    <div className="font-doto font-black">{formatNumber(trade.confidence * 100, 0)}%</div>
                  </div>
                )}
                {/* PnL for Exit Trades - Integrated in grid */}
                {isExit && (
                  <div className={`border-2 border-white px-2 py-1 ${
                    trade.pnl > 0 ? "bg-lime-400 text-black" : "bg-red-500 text-white"
                  }`}>
                    <div className="font-doto uppercase text-xs opacity-90">Result</div>
                    <div className="font-doto font-black">
                      {trade.pnl > 0 ? "+" : ""}{formatNumber(trade.pnl, 1)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Take Profit & Stop Loss (for Entry Trades) */}
              {isEntry && (trade.takeProfit || trade.stopLoss) && (
                <div className="grid grid-cols-2 gap-2 mb-2 text-xs border-t-2 border-white/30 pt-2">
                  {trade.takeProfit && (
                    <div className="border-2 border-lime-400 bg-lime-400/10 text-lime-400 px-2 py-1">
                      <div className="font-doto uppercase text-xs opacity-90">Take Profit</div>
                      <div className="font-doto font-black">${formatNumber(trade.takeProfit, 2)}</div>
                    </div>
                  )}
                  {trade.stopLoss && (
                    <div className="border-2 border-red-400 bg-red-400/10 text-red-400 px-2 py-1">
                      <div className="font-doto uppercase text-xs opacity-90">Stop Loss</div>
                      <div className="font-doto font-black">${formatNumber(trade.stopLoss, 2)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Reason with Typing Animation */}
              {trade.aiReason && (
                <div className="border-t-2 border-white/30 pt-2">
                  <div className="text-xs font-doto uppercase tracking-wide text-lime-400 mb-1 opacity-90">
                    {isEntry ? "AI REASONING" : "AI CONCLUDED"}
                  </div>
                  <AnimatedDescription 
                    text={trade.aiReason} 
                    isActive={isTyping}
                  />
                </div>
              )}
            </motion.div>
            );
          })}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
}

