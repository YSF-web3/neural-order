"use client";

/**
 * AI Agent Card Component
 * Displays individual AI trading agent with stats and status
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { AIAgent } from "@/types";
import { formatNumber } from "@/lib/utils";

interface AIAgentCardProps {
  agent: AIAgent;
  rank: number;
  onClick?: () => void;
}

export function AIAgentCard({ agent, rank, onClick }: AIAgentCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/agent/${agent.id}`);
    }
  };
  const isProfitable = agent.pnl > 0;
  const statusColor = agent.status === 'active' ? 'bg-lime-400' : agent.status === 'slow' ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      onClick={handleClick}
      className="border-4 border-white bg-white text-black p-4 cursor-pointer brutal-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Rank Badge */}
          <div className="w-10 h-10 bg-black text-white border-4 border-black flex items-center justify-center text-xs font-doto font-black">
            #{rank}
          </div>
          
          {/* Avatar or Logo */}
          {agent.logo ? (
            <div className="w-14 h-14 border-4 border-black flex items-center justify-center bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={agent.logo}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="text-2xl w-14 h-14 border-4 border-black bg-white flex items-center justify-center font-doto">{agent.avatar}</div>
          )}
          
          {/* Name & Strategy */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-doto font-black uppercase tracking-wide">{agent.name}</h3>
              {agent.twitter && (
                <a
                  href={agent.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-doto uppercase tracking-wide underline hover:no-underline"
                  title="Open on X / Twitter"
                >
                  X
                </a>
              )}
            </div>
            <p className="text-xs font-doto uppercase tracking-wide">{agent.strategy}</p>
          </div>
        </div>

        {/* PnL Display */}
        <div className="text-right">
          <div className={`text-lg md:text-xl font-doto font-black ${isProfitable ? "text-lime-400" : "text-red-500"} counter-text`}>
            {isProfitable ? "+" : ""}{formatNumber(agent.pnl, 1)}%
          </div>
          <div className="text-xs font-doto uppercase tracking-wide">
            ${formatNumber(agent.balance ?? 0, 0)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-black text-white p-3 border-4 border-black">
          <div className="text-xs font-doto uppercase mb-1 tracking-wide">Win</div>
          <div className="text-xs md:text-sm font-doto font-black counter-text">
            {formatNumber(agent.winRate, 0)}%
          </div>
        </div>
        <div className="bg-white text-black p-3 border-4 border-black">
          <div className="text-xs font-doto uppercase mb-1 tracking-wide">Trades</div>
          <div className="text-xs md:text-sm font-doto font-black counter-text">{agent.totalTrades}</div>
        </div>
        <div className="bg-black text-white p-3 border-4 border-black">
          <div className="text-xs font-doto uppercase mb-1 tracking-wide">Vol</div>
          <div className="text-xs md:text-sm font-doto font-black counter-text">
            ${formatNumber(agent.volume24h / 1000, 0)}k
          </div>
        </div>
      </div>

      {/* AI Thought/Reasoning */}
      {agent.aiThought && (
        <div className="mt-3 pt-3 border-t-4 border-black">
          <div className="text-xs font-doto uppercase tracking-wide text-lime-400 mb-1">AI ANALYSIS</div>
          <div className="text-xs font-doto uppercase tracking-wide opacity-80">{agent.aiThought}</div>
        </div>
      )}

      {/* Open Positions */}
      {agent.openPositions && agent.openPositions.length > 0 && (
        <div className="mt-3 pt-3 border-t-4 border-black">
          <div className="text-xs font-doto uppercase tracking-wide text-cyan-400 mb-2">OPEN POSITIONS ({agent.openPositions.length})</div>
          <div className="space-y-2">
            {agent.openPositions.slice(0, 2).map((pos, idx) => (
              <div key={idx} className="bg-black text-white p-2 border-2 border-black">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-doto uppercase">{pos.coin}</span>
                  <span className={`text-xs font-doto font-black ${pos.signal === 'long' ? 'text-lime-400' : 'text-red-400'}`}>
                    {pos.signal.toUpperCase()}
                  </span>
                </div>
                {/* Position Details - Entry, Current, Price Change */}
                <div className="grid grid-cols-2 gap-1 text-xs font-doto uppercase opacity-80 mb-2">
                  <div>
                    <div>Entry: ${formatNumber(pos.entry_price, 2)}</div>
                    <div className={pos.current_price ? `${pos.price_change >= 0 ? 'text-lime-400' : 'text-red-400'}` : ''}>
                      Now: ${formatNumber(pos.current_price || pos.entry_price, 2)}
                    </div>
                  </div>
                  <div>
                    <div className={`font-black ${pos.price_change >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                      {pos.price_change >= 0 ? '+' : ''}{formatNumber(pos.price_change || 0, 2)}%
                    </div>
                    <div className="text-xs opacity-70">Price Δ</div>
                  </div>
                </div>
                
                {/* PnL, Size, Leverage */}
                <div className="grid grid-cols-2 gap-1 text-xs font-doto uppercase opacity-80 mb-2">
                  <div>
                    <div className={`font-black ${pos.pnl >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                      PnL: {pos.pnl >= 0 ? '+' : ''}{formatNumber(pos.pnl || 0, 2)}%
                    </div>
                    <div className="text-xs opacity-70">
                      ${pos.pnlAbsolute >= 0 ? '+' : ''}${formatNumber(pos.pnlAbsolute || 0, 2)}
                    </div>
                  </div>
                  <div>
                    <div>Size: ${formatNumber(pos.size_usd, 0)}</div>
                    <div className="text-xs opacity-70">Lev: {pos.leverage}x</div>
                  </div>
                </div>
                
                {/* Take Profit & Stop Loss */}
                <div className="grid grid-cols-2 gap-1 text-xs font-doto uppercase border-t-2 border-white pt-2 mt-2">
                  <div>
                    <div className="text-lime-400 font-black">TP: ${formatNumber(pos.profit_target || 0, 2)}</div>
                    <div className="text-xs opacity-70">Take Profit</div>
                  </div>
                  <div>
                    <div className="text-red-400 font-black">SL: ${formatNumber(pos.stop_loss || 0, 2)}</div>
                    <div className="text-xs opacity-70">Stop Loss</div>
                  </div>
                </div>
              </div>
            ))}
            {agent.openPositions.length > 2 && (
              <div className="text-xs font-doto uppercase tracking-wide text-center opacity-60">
                +{agent.openPositions.length - 2} more positions
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t-4 border-black">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 ${statusColor} border-2 border-black`} />
          <span className="text-xs font-doto uppercase tracking-wide">{agent.status}</span>
        </div>
        {agent.lastTrade && (
          <div className="text-xs font-doto uppercase tracking-wide">
            {agent.lastTrade.side} {agent.lastTrade.pair}
          </div>
        )}
      </div>
    </motion.div>
  );
}



