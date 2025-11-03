/**
 * Global TypeScript type definitions for Aster Royale
 */

/**
 * User profile data
 */
export interface UserProfile {
  address: string;
  displayName?: string;
  avatar?: string;
  xp: number;
  level: number;
  achievements: Achievement[];
  totalPnl: number;
  totalVolume: number;
  rank: number;
}


/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

/**
 * Season data
 */
export interface Season {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  rewards: Reward[];
  participantCount: number;
}

/**
 * Reward structure
 */
export interface Reward {
  id: string;
  type: "roy" | "xp" | "achievement" | "nft";
  amount: number;
  description: string;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName?: string;
  xp: number;
  pnl: number;
  volume: number;
  level: number;
}

/**
 * Mission/Quest definition
 */
export interface Mission {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "seasonal";
  xpReward: number;
  royReward: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

/**
 * AI Trading Agent Interface
 * Represents a trading agent competing in the arena
 */
export interface AIAgent {
  id: string;
  name: string;
  strategy: string;
  avatar: string; // Emoji or icon
  logo?: string; // Logo image path
  twitter?: string; // Agent Twitter/X profile URL
  balance?: number; // Paper trading balance
  pnl: number; // Percentage
  pnlAbsolute: number; // USD value
  winRate: number; // Percentage
  totalTrades: number;
  volume24h: number; // USD
  prompt?: string; // LLM trading prompt for display
  lastTrade: {
    pair: string;
    side: "long" | "short";
    amount: number;
    price: number;
    pnl: number;
    timestamp: number;
  } | null;
  aiThought?: string; // Current AI "thinking"
  status: "active" | "slow" | "error";
  decisionHistory?: Array<{
    timestamp: number;
    prompt: string;
    response: any;
    reasoning: string;
    action: string;
    marketData: any;
  }>;
  openPositions?: Array<{
    coin: string;
    signal: "long" | "short";
    entry_price: number;
    current_price?: number;      // Current market price (enriched from API)
    price_change?: number;       // Price change percentage from entry (enriched)
    profit_target: number;
    stop_loss: number;
    leverage: number;
    size_usd: number;
    pnl: number;                 // Unrealized PnL percentage (enriched)
    pnlAbsolute: number;          // Unrealized PnL in USD (enriched)
    opened_at: number;
  }>;
}

/**
 * Trade Interface
 * Represents a trading activity from an AI agent
 */
export interface Trade {
  id: string;
  agentId: string;
  agentName: string;
  pair: string;
  side: "long" | "short";
  amount: number;
  price: number;
  pnl: number;
  timestamp: number;
  tradeType?: "entry" | "exit"; // Track if this is an entry or exit trade
  leverage?: number;
  size_usd?: number;
  aiReason?: string;
  orderType?: string;
  takeProfit?: number;  // Take profit price (for entry trades)
  stopLoss?: number;    // Stop loss price (for entry trades)
}

