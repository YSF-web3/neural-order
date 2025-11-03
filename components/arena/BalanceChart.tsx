"use client";

/**
 * Balance Chart Component
 * Shows live evolution of each agent's balance over time
 * Brutalist design with smooth interactions
 */

import { useMemo, memo, useState, useCallback } from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { TypingText } from '@/components/ui/TypingText';

// Custom tooltip with stable positioning
const CustomTooltip = ({ active, payload, label, hiddenAgents, agentInfo }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Filter out hidden agents and remove duplicates
  const seen = new Set<string>();
  const visiblePayload = payload.filter((item: any) => {
    if (!item.name || hiddenAgents?.has(item.name)) return false;
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });

  if (visiblePayload.length === 0) {
    return null;
  }

  return (
    <div 
      className="bg-black border-4 border-white p-3 font-mono text-white"
      style={{ pointerEvents: 'none' }}
    >
      <p className="text-xs font-bold mb-2 uppercase">{`Time: ${label}`}</p>
      {visiblePayload.map((entry: any, index: number) => {
        const value = entry.value;
        const color = entry.color || '#fff';
        const name = entry.name;
        const info = agentInfo?.get(name);
        
        return (
          <div key={`${name}-${index}`} className="text-xs mb-1 flex items-center gap-2">
            {info?.logo ? (
              <img 
                src={info.logo} 
                alt={name} 
                className="w-4 h-4 border-2 border-white object-cover"
              />
            ) : info?.avatar ? (
              <div className="w-4 h-4 border-2 border-white bg-white text-black flex items-center justify-center text-[10px]">
                {info.avatar}
              </div>
            ) : (
              <span 
                className="inline-block w-3 h-3 border-2 border-white"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="uppercase">{name}: </span>
            <span className="font-black">
              ${typeof value === 'number' ? value.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              }) : value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface BalanceDataPoint {
  time: string;
  [agentName: string]: string | number;
}

interface BalanceChartProps {
  balanceHistory: BalanceDataPoint[];
  agents?: Array<{ name: string; logo?: string; avatar?: string }>;
}

// Brutalist color scheme - all lines use white
const UNIFIED_LINE_COLOR = "#ffffff"; // white - all lines same color


export const BalanceChart = memo(function BalanceChart({ balanceHistory, agents = [] }: BalanceChartProps) {
  const [hiddenAgents, setHiddenAgents] = useState<Set<string>>(new Set());
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  
  // Create agent info map for tooltip and legend
  const agentInfoMap = useMemo(() => {
    const map = new Map<string, { logo?: string; avatar?: string }>();
    agents.forEach(agent => {
      map.set(agent.name, { logo: agent.logo, avatar: agent.avatar });
    });
    return map;
  }, [agents]);

  // Get unique agent names from ALL entries (not just first)
  // This ensures we detect all agents even if some entries are missing some agents
  const agentNames = useMemo(() => {
    if (balanceHistory.length === 0) return [];
    const allKeys = new Set<string>();
    balanceHistory.forEach(entry => {
      Object.keys(entry).forEach(key => {
        if (key !== 'time' && key !== 'timestamp') {
          allKeys.add(key);
        }
      });
    });
    return Array.from(allKeys);
  }, [balanceHistory.length > 0 ? balanceHistory.map(e => Object.keys(e).join(',')).join('|') : '']);

  // Handle legend click
  const handleLegendClick = useCallback((agentName: string) => {
    setHiddenAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentName)) {
        newSet.delete(agentName);
      } else {
        newSet.add(agentName);
      }
      return newSet;
    });
  }, []);

  // Smooth hover handlers
  const handleMouseEnter = useCallback((agent: string) => {
    setHoveredAgent(agent);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredAgent(null);
  }, []);

  return (
    <div className="bg-black border-4 border-white p-6 relative terminal-corner overflow-hidden">
      <div className="absolute top-2 left-2 text-xs font-mono text-lime-400 pulse-glow">┌─ CHART ─┐</div>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-white">
        <h3 className="text-xl md:text-2xl font-doto font-black uppercase tracking-wider">
          <TypingText text="BALANCE EVOLUTION" />
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart 
          data={balanceHistory} 
          margin={{ top: 20, right: 50, left: 20, bottom: 80 }}
        >
          {/* Gradients - all use same white color */}
          <defs>
            {agentNames.map((agent, index) => {
              const gradientId = `gradient-${index}`;
              return (
                <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={UNIFIED_LINE_COLOR} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={UNIFIED_LINE_COLOR} stopOpacity={0.02} />
                </linearGradient>
              );
            })}
          </defs>
          
          {/* Grid */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#333" 
            opacity={0.5}
            strokeWidth={1}
          />
          
          {/* Axes */}
          <XAxis 
            dataKey="time" 
            stroke="#fff"
            style={{ fontSize: '9px', fontFamily: 'monospace' }}
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: '#fff' }}
            axisLine={{ stroke: '#fff', strokeWidth: 2 }}
            interval="preserveStartEnd"
            tickCount={10}
          />
          
          <YAxis 
            stroke="#fff"
            style={{ fontSize: '10px', fontFamily: 'monospace' }}
            domain={['auto', 'auto']}
            tick={{ fill: '#fff' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            axisLine={{ stroke: '#fff', strokeWidth: 2 }}
          />
          
          {/* Tooltip */}
          <Tooltip 
            content={<CustomTooltip hiddenAgents={hiddenAgents} agentInfo={agentInfoMap} />}
            cursor={{ 
              stroke: '#fff', 
              strokeWidth: 2, 
              strokeDasharray: '5 5',
              pointerEvents: 'none'
            }}
            allowEscapeViewBox={{ x: true, y: true }}
            animationDuration={0}
          />
          
          {/* Legend */}
          <Legend 
            wrapperStyle={{ paddingTop: '20px', fontFamily: 'monospace', color: '#fff' }}
            iconType="line"
            iconSize={12}
            content={({ payload }) => {
              const seen = new Set<string>();
              const uniquePayload = payload?.filter((item: any) => {
                if (!item || !item.value) return false;
                if (seen.has(item.value)) return false;
                seen.add(item.value);
                return true;
              }) || [];
              
              return (
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {uniquePayload.map((entry: any, index: number) => {
                    const agentName = entry.value;
                    const isHidden = hiddenAgents.has(agentName);
                    const color = UNIFIED_LINE_COLOR; // All lines same color
                    const info = agentInfoMap.get(agentName);
                    
                    return (
                      <div
                        key={`legend-${agentName}-${index}`}
                        onClick={() => handleLegendClick(agentName)}
                        className="flex items-center gap-2 cursor-pointer px-2 py-1 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-150"
                        style={{ 
                          opacity: isHidden ? 0.3 : 1,
                          textDecoration: isHidden ? 'line-through' : 'none'
                        }}
                      >
                        {info?.logo ? (
                          <img 
                            src={info.logo} 
                            alt={agentName} 
                            className="w-4 h-4 border-2 border-white object-cover"
                          />
                        ) : info?.avatar ? (
                          <span className="text-xs border-2 border-white bg-white text-black w-4 h-4 flex items-center justify-center">
                            {info.avatar}
                          </span>
                        ) : (
                          <span 
                            className="inline-block w-3 h-3 border-2 border-white"
                            style={{ backgroundColor: color }}
                          />
                        )}
                        <span className="text-xs font-mono uppercase">
                          {agentName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
          
          {/* Lines - all use same white color */}
          {agentNames.map((agent, index) => {
            const strokeColor = UNIFIED_LINE_COLOR; // All lines same color
            const gradientId = `gradient-${index}`;
            const isHidden = hiddenAgents.has(agent);
            const isHovered = hoveredAgent === agent;
            
            // Create unique data key to ensure each line is separate
            const lineKey = `${agent}-line-${index}`;
            
            return (
              <g key={lineKey} opacity={isHidden ? 0.3 : 1}>
                {/* Area fill */}
                {!isHidden && (
                  <Area
                    key={`${agent}-area-${index}`}
                    type="monotone"
                    dataKey={agent}
                    fill={`url(#${gradientId})`}
                    stroke="none"
                    animationDuration={0}
                    isAnimationActive={false}
                  />
                )}
                
                {/* Line with smooth hover */}
                <Line
                  key={`${agent}-line-${index}`}
                  type="monotone"
                  dataKey={agent}
                  stroke={strokeColor}
                  strokeWidth={isHovered ? 4 : hoveredAgent ? 2 : 2.5}
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: strokeColor,
                    stroke: '#fff',
                    strokeWidth: 2
                  }}
                  animationDuration={0}
                  isAnimationActive={false}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  connectNulls={true}
                  onMouseEnter={() => handleMouseEnter(agent)}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

BalanceChart.displayName = 'BalanceChart';
