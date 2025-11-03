"use client";

/**
 * Aster Royale: Agents Dashboard
 * Shows agent logic, prompts, and positions with the same styling as main page
 */

import { useState } from "react";
import { motion } from "framer-motion";
import AgentsLogic from "@/components/arena/AgentsLogic";
import PromptsPanel from "@/components/arena/PromptsPanel";
import PositionsTable from "@/components/arena/PositionsTable";
import { PriceTicker } from "@/components/arena/PriceTicker";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [isLive] = useState(true);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden brutal-bg">
      {/* Scanline effect for retro feel */}
      <div className="scanline fixed inset-0 pointer-events-none z-50 overflow-hidden" />
      
      {/* Price Ticker - Top of page */}
      <div className="sticky top-0 z-40 bg-black border-b-4 border-white">
        <PriceTicker />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header - Brutal and bold (matches main page) */}
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
            AGENTS DASHBOARD
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

        {/* Main Content - Brutal Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8 items-stretch">
          {/* Agents Logic Panel */}
          <div className="xl:col-span-1 flex">
            <div className="bg-black border-4 border-white p-6 relative terminal-corner h-full w-full flex flex-col">
              <div className="absolute top-2 left-2 text-xs font-mono text-lime-400 pulse-glow">┌─ LOGIC ─┐</div>
              <h2 className="text-xl md:text-2xl font-doto font-black uppercase mb-6 tracking-wider mt-4">
                AGENTS LOGIC
              </h2>
              <div className="flex-1 overflow-y-auto pr-2">
                <AgentsLogic />
              </div>
            </div>
          </div>

          {/* Prompts & Positions Panels */}
          <div className="xl:col-span-2 space-y-4 flex flex-col">
            {/* Prompts Panel */}
            <div className="flex-1 flex">
              <div className="bg-black border-4 border-white p-6 relative terminal-corner h-full w-full flex flex-col">
                <div className="absolute top-2 left-2 text-xs font-mono text-lime-400 pulse-glow">┌─ PROMPTS ─┐</div>
                <h2 className="text-xl md:text-2xl font-doto font-black uppercase mb-6 tracking-wider mt-4">
                  AGENT PROMPTS
                </h2>
                <div className="flex-1 overflow-y-auto pr-2">
                  <PromptsPanel />
                </div>
              </div>
            </div>

            {/* Positions Panel */}
            <div className="flex-1 flex">
              <div className="bg-black border-4 border-white p-6 relative terminal-corner h-full w-full flex flex-col">
                <div className="absolute top-2 left-2 text-xs font-mono text-lime-400 pulse-glow">┌─ POSITIONS ─┐</div>
                <h2 className="text-xl md:text-2xl font-doto font-black uppercase mb-6 tracking-wider mt-4">
                  TRADING POSITIONS
                </h2>
                <div className="flex-1 overflow-y-auto pr-2">
                  <PositionsTable />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


