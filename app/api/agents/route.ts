/**
 * API Route: /api/agents
 * Handles agent data operations
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Agent } from "@/models/Agent";
import { Position } from "@/models/Position";
import { Trade } from "@/models/Trade";

// Static Twitter/X handle mapping for agents
const AGENT_TWITTER: Record<string, string> = {
  GEMINI: "https://x.com/GEMINI_ORDER",
  CLAUDE: "https://x.com/CLAUDE_ORDER",
  GROK: "https://x.com/GROK_ORDER",
  DEEPSEEK: "https://x.com/DEEPSEEK_ORDER",
  OPENAI: "https://x.com/OPENAI_ORDER",
  QWEN: "https://x.com/QWEN_ORDER",
};

/**
 * Fetch current market prices from Aster API
 */
async function getMarketPrices() {
  try {
    const response = await fetch('https://fapi.asterdex.com/fapi/v1/ticker/price', {
      cache: 'no-store', // Always fetch fresh prices
    });
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return {};
    }
    
    const priceMap: Record<string, number> = {};
    data.forEach((ticker: any) => {
      if (ticker?.symbol && ticker?.price) {
        const coinMatch = ticker.symbol.match(/^([A-Z]+)USDT$/);
        if (coinMatch && coinMatch[1].length <= 5) {
          priceMap[coinMatch[1]] = parseFloat(ticker.price);
        }
      }
    });
    
    return priceMap;
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return {};
  }
}

/**
 * Calculate unrealized PnL from open positions
 * Accounts for leverage: PnL is calculated on full notional size
 */
function calculateUnrealizedPnL(activePositions: any[], marketPrices: Record<string, number>): number {
  let totalUnrealizedPnL = 0;
  
  for (const position of activePositions) {
    const currentPrice = marketPrices[position.coin];
    if (!currentPrice) continue;
    
    // Calculate price change percentage
    const priceChange = ((currentPrice - position.entry_price) / position.entry_price) * 100;
    
    // PnL is positive for long when price goes up, negative for short
    const pnlPercent = position.signal === 'long' ? priceChange : -priceChange;
    
    // Calculate PnL on full notional size (leverage already included in size_usd)
    const pnlAbsolute = (pnlPercent / 100) * (position.size_usd || 0);
    
    totalUnrealizedPnL += pnlAbsolute;
  }
  
  return totalUnrealizedPnL;
}

/**
 * Get realized PnL from all closed trades
 */
async function getRealizedPnL(agentId: string): Promise<number> {
  const exitTrades = await Trade.find({ 
    agentId,
    tradeType: 'exit',
  });
  
  const realizedPnL = exitTrades.reduce((sum, trade) => {
    return sum + (trade.pnlAbsolute || 0);
  }, 0);
  
  return realizedPnL;
}

/**
 * Calculate total balance from trades and positions
 * Formula: Balance = Initial + Realized PnL + Unrealized PnL
 * NOTE: This function is now deprecated - we use balance directly from database
 * which is synced from exchange by the backend exchange-sync module
 */
async function calculateAgentBalance(
  agentId: string, 
  activePositions: any[], 
  marketPrices: Record<string, number>
): Promise<number> {
  const INITIAL_BALANCE = 1000;
  
  // Get realized PnL from all closed trades
  const realizedPnL = await getRealizedPnL(agentId);
  
  // Calculate unrealized PnL from open positions
  const unrealizedPnL = calculateUnrealizedPnL(activePositions, marketPrices);
  
  // Total balance = initial + realized + unrealized
  return INITIAL_BALANCE + realizedPnL + unrealizedPnL;
}

/**
 * Enrich position with current price and PnL calculations
 */
function enrichPosition(position: any, marketPrices: Record<string, number>) {
  const currentPrice = marketPrices[position.coin];
  if (!currentPrice) {
    return {
      ...position,
      current_price: position.entry_price, // Use entry if no market data
      price_change: 0,
      pnl: 0,
      pnlAbsolute: 0,
    };
  }
  
  // Calculate price change percentage
  const priceChange = ((currentPrice - position.entry_price) / position.entry_price) * 100;
  
  // PnL is positive for long when price goes up, negative for short
  const pnlPercent = position.signal === 'long' ? priceChange : -priceChange;
  
  // Calculate PnL on full notional size (leverage already included in size_usd)
  const pnlAbsolute = (pnlPercent / 100) * (position.size_usd || 0);
  
  return {
    ...position,
    current_price: currentPrice,
    price_change: priceChange,
    pnl: pnlPercent,
    pnlAbsolute: pnlAbsolute,
  };
}

/**
 * GET /api/agents
 * Fetch all agents with their open positions (enriched with current prices and PnL)
 */
export async function GET() {
  try {
    await connectDB();
    
    let agents = await Agent.find({}).sort({ pnl: -1 });
    
    // Frontend is read-only - initialize agents using backend/init-agents.js
    if (agents.length === 0) {
      return NextResponse.json(
        { 
          agents: [],
          message: "No agents found. Initialize using: node backend/init-agents.js"
        },
        { status: 200 }
      );
    }
    
    // Fetch current market prices once for all positions
    const marketPrices = await getMarketPrices();
    
    // Fetch open positions for all agents and recalculate balance/PnL
    const agentsWithPositions = await Promise.all(
      agents.map(async (agent) => {
        // Use agent.name (ID) not _id for finding positions
        // Positions are stored with agentId = agent name (e.g., "OPENAI")
        const openPositions = await Position.find({
          agentId: agent.name,
          status: 'open'
        }).sort({ opened_at: -1 });
        
        // Enrich each position with current price and calculated PnL
        const enrichedPositions = openPositions.map((pos: any) => 
          enrichPosition(pos.toObject(), marketPrices)
        );
        
        // Use balance from database (already synced from exchange by backend)
        // The backend syncs the actual balance from Aster exchange every 30 seconds
        // This includes wallet balance + unrealized PnL from open positions
        const agentObj = agent.toObject();
        const upperName = (agentObj.name || "").toString().toUpperCase();
        const twitter = AGENT_TWITTER[upperName] || undefined;
        
        // Use balance, pnl, and pnlAbsolute directly from database (synced from exchange)
        // These are already calculated and updated by the backend exchange-sync module
        return {
          ...agentObj,
          balance: agentObj.balance || 0, // Use database balance (synced from exchange)
          pnl: agentObj.pnl || 0,        // Use database PnL (synced from exchange)
          pnlAbsolute: agentObj.pnlAbsolute || 0, // Use database PnL absolute (synced from exchange)
          openPositions: enrichedPositions || [],
          twitter,
        };
      })
    );
    
    return NextResponse.json({ agents: agentsWithPositions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * Initialize agents (if they don't exist)
 */
export async function POST() {
  return NextResponse.json(
    { 
      message: "Frontend is read-only. Use backend/init-agents.js to create agents.",
      note: "Run: node backend/init-agents.js"
    },
    { status: 200 }
  );
}

/**
 * PUT /api/agents/simulate
 * Simulate trading activity for all agents
 */
export async function PUT(req: NextRequest) {
  return NextResponse.json(
    { 
      message: "Frontend is read-only. Use backend/trading-worker.js for trading.",
      note: "Run: node backend/trading-worker.js"
    },
    { status: 200 }
  );
}

