/**
 * Balance Calculator
 * Computes agent balance from historical trades and positions
 */

import { Trade } from "@/models/Trade";
import { Position } from "@/models/Position";
import type { IAgent } from "@/models/Agent";

const INITIAL_BALANCE = 1000;

/**
 * Calculate realized PnL from all closed trades
 * Returns the sum of all absolute PnL from exit trades
 */
export async function getRealizedPnL(agentId: string): Promise<number> {
  // Get all exit trades (closed positions)
  const exitTrades = await Trade.find({ 
    agentId,
    tradeType: "exit",
  });

  // Sum up all pnlAbsolute from exit trades
  const realizedPnL = exitTrades.reduce((sum, trade) => {
    return sum + (trade.pnlAbsolute || 0);
  }, 0);

  return realizedPnL;
}

/**
 * Calculate unrealized PnL from open positions
 * Takes current market prices and calculates PnL for all open positions
 */
export function calculateUnrealizedPnL(
  activePositions: any[],
  currentPrices: Record<string, number>
): number {
  let totalUnrealizedPnL = 0;

  for (const position of activePositions) {
    const currentPrice = currentPrices[position.coin];
    if (!currentPrice) continue;

    // Calculate price change percentage
    const priceChange = ((currentPrice - position.entry_price) / position.entry_price) * 100;
    
    // PnL is positive for long when price goes up, negative for short when price goes up
    const pnlPercent = position.signal === "long" ? priceChange : -priceChange;
    
    // Convert to absolute USD value
    const pnlAbsolute = (pnlPercent / 100) * position.size_usd;
    
    totalUnrealizedPnL += pnlAbsolute;
  }

  return totalUnrealizedPnL;
}

/**
 * Calculate total balance from:
 * - Initial balance
 * + All realized PnL from closed trades
 * + Unrealized PnL from open positions
 */
export async function calculateAgentBalance(
  agent: IAgent,
  currentPrices: Record<string, number>
): Promise<number> {
  // Get realized PnL from all closed trades
  const realizedPnL = await getRealizedPnL(agent._id.toString());

  // Calculate unrealized PnL from open positions
  const unrealizedPnL = calculateUnrealizedPnL(
    agent.activePositions || [],
    currentPrices
  );

  // Total balance = initial + realized + unrealized
  const totalBalance = INITIAL_BALANCE + realizedPnL + unrealizedPnL;

  return totalBalance;
}

/**
 * Update agent balance and related metrics
 * Computes balance from trades and positions, then updates agent stats
 */
export async function updateAgentBalance(
  agent: IAgent,
  currentPrices: Record<string, number>
): Promise<void> {
  // Calculate new balance from trades and positions
  const newBalance = await calculateAgentBalance(agent, currentPrices);

  // Update balance
  agent.balance = newBalance;

  // Calculate PnL metrics
  agent.pnlAbsolute = newBalance - INITIAL_BALANCE;
  agent.pnl = (agent.pnlAbsolute / INITIAL_BALANCE) * 100;

  // Calculate win rate from trades
  const exitTrades = await Trade.find({ 
    agentId: agent._id.toString(),
    tradeType: "exit",
  }).sort({ timestamp: -1 });

  if (exitTrades.length > 0) {
    const winningTrades = exitTrades.filter(t => t.pnl > 0).length;
    agent.winRate = (winningTrades / exitTrades.length) * 100;
    agent.totalTrades = exitTrades.length;
  }

  // Save the updated agent
  await agent.save();
}

