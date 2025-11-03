/**
 * Trading Engine
 * Simulates AI agent trading decisions based on their prompts
 */

import type { IAgent } from "@/models/Agent";
import type { IPosition } from "@/models/Position";
import { fetchAllPrices } from "./aster-prices";

const LEVERAGE_OPTIONS = [5, 8, 10, 12, 15, 20];

/**
 * Fetch real market data from Aster API for trading analysis
 * Returns all available trading pairs with prices and volatility estimates
 */
export async function getMarketData(): Promise<{
  timestamp: number;
  prices: Record<string, number>;
  volatility: Record<string, number>;
}> {
  try {
    // Fetch all real prices from Aster API
    const prices = await fetchAllPrices();
    
    // Calculate volatility estimates based on price
    // Higher price generally indicates higher absolute volatility
    const volatility: Record<string, number> = {};
    
    // Convert prices to volatility estimates
    // Formula: volatility ≈ price * 0.02 (approximately 2% volatility)
    Object.entries(prices).forEach(([coin, price]) => {
      volatility[coin] = price * 0.02;
    });
    
    return {
      timestamp: Date.now(),
      prices,
      volatility,
    };
  } catch (error) {
    console.error('Error fetching market data from Aster API:', error);
    
    // Return empty data if API fails (agents will have no trades)
    return {
      timestamp: Date.now(),
      prices: {},
      volatility: {},
    };
  }
}

/**
 * Agent Decision Engine
 * Based on agent's strategy/prompt, generates trading decisions
 * Uses OpenAI for real AI-powered decisions
 */
export async function generateAgentDecision(
  agent: IAgent,
  marketData: any
): Promise<any> {
  // Use OpenAI if API key is available, otherwise use simulated decisions
  if (process.env.OPENAI_API_KEY) {
    const { generateAITradingDecision } = await import("./openai-service");
    return await generateAITradingDecision(
      agent.prompt,
      marketData,
      agent.activePositions || [],
      agent.balance
    );
  }
  // If OpenAI is not available, use simulated decisions
  const activePositions = agent.activePositions || [];
  const totalExposure = activePositions.reduce((sum, pos) => sum + (pos.size_usd || 0), 0);
  const exposurePercent = (totalExposure / agent.balance) * 100;

  const decisions: any = {};
  let conclusion = "";

  // Check existing positions for exit conditions
  for (const position of activePositions) {
    const currentPrice = marketData.prices[position.coin];
    if (!currentPrice) continue;

    // Check stop loss or take profit
    const priceChange = ((currentPrice - position.entry_price) / position.entry_price) * 100;
    const pnl = position.signal === "long" ? priceChange : -priceChange;

    if (currentPrice <= position.stop_loss || currentPrice >= position.profit_target) {
      const decision = position.signal === "long" ? "close" : "close";
      decisions[position.coin] = {
        trade_signal_args: {
          coin: position.coin,
          signal: decision,
          entry_price: currentPrice,
          justification: `Hit ${currentPrice <= position.stop_loss ? "stop loss" : "take profit"} at ${currentPrice}`,
        },
      };
      conclusion += `Closing ${position.coin} ${position.signal} at ${currentPrice.toFixed(2)}. `;
    } else {
      decisions[position.coin] = {
        trade_signal_args: {
          coin: position.coin,
          signal: "hold",
          justification: "Position still valid",
        },
      };
    }
  }

  // Don't open new positions if exposure > 70%
  if (exposurePercent >= 70) {
    conclusion += `Exposure at ${exposurePercent.toFixed(1)}% - waiting. `;
    return { decisions, conclusion };
  }

  // Generate new entry signals based on strategy
  // Iterate over all available markets from Aster API
  const availableMarkets = Object.keys(marketData.prices);
  
  for (const coin of availableMarkets) {
    const hasActivePosition = activePositions.some((p) => p.coin === coin);
    if (hasActivePosition) continue; // Already have position

    const currentPrice = marketData.prices[coin];
    if (!currentPrice) continue;

    // Simulate agent decision based on strategy
    const confidence = Math.random() * 0.4 + 0.6; // 0.6 - 1.0
    const shouldTrade = confidence > 0.6 && Math.random() > 0.7;

    if (!shouldTrade) {
      decisions[coin] = {
        trade_signal_args: {
          coin,
          signal: "wait",
          justification: "No clear setup",
        },
      };
      continue;
    }

    // Generate trade
    const signal = Math.random() > 0.5 ? "long" : "short";
    const leverage = LEVERAGE_OPTIONS[Math.floor(Math.random() * LEVERAGE_OPTIONS.length)];
    const baseRisk = 5 + confidence * 10;
    const riskUsd = (agent.balance * baseRisk) / 100;
    const sizeUsd = riskUsd * leverage;

    // Calculate SL/TP
    const volatility = marketData.volatility?.[coin] || 1.0;
    const stopLossPercent = Math.max(0.3, volatility * 0.5);
    const takeProfitPercent = Math.max(0.5, volatility * 1.5);

    const stopLoss = signal === "long" 
      ? currentPrice * (1 - stopLossPercent / 100)
      : currentPrice * (1 + stopLossPercent / 100);
    
    const profitTarget = signal === "long"
      ? currentPrice * (1 + takeProfitPercent / 100)
      : currentPrice * (1 - takeProfitPercent / 100);

    const duration = leverage >= 15 ? "15min" : leverage >= 12 ? "30min" : leverage >= 10 ? "60min" : "2h_to_8h";

    decisions[coin] = {
      trade_signal_args: {
        coin,
        signal,
        quantity: sizeUsd,
        entry_price: currentPrice,
        profit_target: profitTarget,
        stop_loss: stopLoss,
        leverage,
        confidence,
        risk_usd: riskUsd,
        size_usd: sizeUsd,
        expected_duration: duration,
        invalidation_condition: `${signal.toUpperCase()} invalidation on ${stopLossPercent.toFixed(2)}% move`,
        justification: `${agent.strategy} setup on ${coin} - ${confidence.toFixed(2)} confidence`,
      },
    };
    conclusion += `${coin} ${signal.toUpperCase()} opportunity - ${confidence.toFixed(2)} confidence. `;
  }

  return { decisions, conclusion };
}

/**
 * Execute a trading decision (paper trading)
 */
export function executeTrade(
  agent: IAgent,
  decision: any,
  marketPrice: number
): { success: boolean; newPosition?: any; closedPosition?: any } {
  const signal = decision.trade_signal_args.signal;

  if (signal === "wait" || signal === "hold") {
    return { success: false };
  }

  if (signal === "close") {
    // Find and close the position
    return { success: true };
  }

  // Open new position (long/short)
  const newPosition = {
    coin: decision.trade_signal_args.coin,
    entry_price: marketPrice,
    current_price: marketPrice,
    profit_target: decision.trade_signal_args.profit_target,
    stop_loss: decision.trade_signal_args.stop_loss,
    leverage: decision.trade_signal_args.leverage,
    size_usd: decision.trade_signal_args.size_usd,
    signal: signal,
    opened_at: Date.now(),
    expected_duration: decision.trade_signal_args.expected_duration,
  };

  return { success: true, newPosition };
}

