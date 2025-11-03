/**
 * API Client for frontend
 * Handles all API calls to the backend
 */

import type { AIAgent, Trade } from "@/types";

const API_BASE = "/api";

/**
 * Fetch all agents from the API
 * Returns real data from the database
 */
export async function fetchAgents(): Promise<AIAgent[]> {
  const response = await fetch(`${API_BASE}/agents`);
  const data = await response.json();
  // Map database agents to frontend format
  return data.agents?.map((agent: any) => ({
    id: agent.id || agent._id?.toString() || '',
    name: agent.name,
    strategy: agent.strategy,
    avatar: agent.avatar,
    logo: agent.logo,
    balance: agent.balance || 1000,
    pnl: agent.pnl || 0,
    pnlAbsolute: agent.pnlAbsolute || 0,
    winRate: agent.winRate || 50,
    totalTrades: agent.totalTrades || 0,
    volume24h: agent.volume24h || 0,
    prompt: agent.prompt,
    lastTrade: agent.lastTrade,
    aiThought: agent.aiThought,
    status: agent.status || 'active',
    decisionHistory: agent.decisionHistory || [],
    openPositions: agent.openPositions || [],
  })) || [];
}

/**
 * Initialize agents (POST) - Not used in production
 */
export async function initializeAgents(): Promise<AIAgent[]> {
  const response = await fetch(`${API_BASE}/agents`, {
    method: "POST",
  });
  const data = await response.json();
  return data.agents || [];
}

/**
 * Fetch live updates from the backend
 * Returns all recent trades (both entry and exit) to show complete AI activity
 */
export async function fetchLiveUpdates(): Promise<{
  agents: AIAgent[];
  newTrades: Trade[];
}> {
  // Fetch updated agents (trading worker updates them)
  const agents = await fetchAgents();
  
  // Fetch recent trades (both entry and exit) to show full AI activity
  const trades = await fetchTrades(30);
  
  return {
    agents,
    newTrades: trades,
  };
}

/**
 * Fetch recent trades from the database
 * Returns BOTH entry and exit trades so users can see what each AI is doing in real-time
 * Entry trades show when an AI opens a position, exit trades show when they close it
 */
export async function fetchTrades(
  limit: number = 30,
  agentId?: string
): Promise<Trade[]> {
  let url = `${API_BASE}/trades?limit=${limit}`;
  if (agentId) {
    url += `&agentId=${agentId}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  
  // Map database trades to frontend format
  return data.trades?.map((trade: any) => ({
    id: trade._id?.toString() || `trade-${trade.timestamp}`,
    agentId: trade.agentId,
    agentName: trade.agentName,
    pair: trade.pair,
    side: trade.side,
    amount: trade.amount,
    price: trade.price,
    pnl: trade.pnl || 0,
    timestamp: trade.timestamp,
    tradeType: trade.tradeType,
    leverage: trade.leverage,
    size_usd: trade.size_usd,
    aiReason: trade.aiReason,
    orderType: trade.orderType,
  })) || [];
}

/**
 * Fetch positions from the database
 * Can filter by agentId and status (open/closed)
 */
export async function fetchPositions(
  limit: number = 100,
  agentId?: string,
  status?: "open" | "closed"
): Promise<any[]> {
  let url = `${API_BASE}/positions?limit=${limit}`;
  if (agentId) {
    url += `&agentId=${agentId}`;
  }
  if (status) {
    url += `&status=${status}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  
  return data.positions || [];
}

/**
 * Fetch balance history snapshots for chart persistence
 * Fetches last N hours of balance data across all agents
 */
export async function fetchBalanceHistory(hours: number | 'all' = 1): Promise<any[]> {
  const url =
    hours === 'all'
      ? `${API_BASE}/balance-snapshots?all=true`
      : `${API_BASE}/balance-snapshots?hours=${hours}`;
  const response = await fetch(url);
  const data = await response.json();
  
  return data.snapshots || [];
}

