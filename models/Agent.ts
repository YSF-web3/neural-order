/**
 * AI Agent Model
 * MongoDB schema for trading agents
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IAgent extends Document {
  id: string;
  name: string;
  strategy: string;
  description: string;
  prompt: string; // AI trading prompt
  avatar: string;
  logo?: string; // Logo image path
  balance: number; // Paper trading balance
  pnl: number; // Percentage
  pnlAbsolute: number; // USD
  winRate: number;
  totalTrades: number;
  volume24h: number;
  activePositions: Array<{
    coin: string;
    entry_price: number;
    current_price: number;
    profit_target: number;
    stop_loss: number;
    leverage: number;
    size_usd: number;
    signal: "long" | "short";
    opened_at: number;
    expected_duration: string;
  }>;
  lastTrade: {
    pair: string;
    side: "long" | "short";
    amount: number;
    price: number;
    pnl: number;
    timestamp: number;
  } | null;
  aiThought?: string;
  decisionHistory: Array<{
    timestamp: number;
    prompt: string;
    response: any;
    reasoning: string;
    action: string;
    marketData: any;
  }>;
  status: "active" | "slow" | "error";
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, unique: true },
    strategy: { type: String, required: true },
    description: { type: String, default: "" },
    prompt: { type: String, default: "" },
    avatar: { type: String, required: true },
    logo: { type: String },
    balance: { type: Number, default: 1000 }, // Start with $1k paper balance
    pnl: { type: Number, default: 0 },
    pnlAbsolute: { type: Number, default: 0 },
    winRate: { type: Number, default: 50 },
    totalTrades: { type: Number, default: 0 },
    volume24h: { type: Number, default: 0 },
    activePositions: { type: [Schema.Types.Mixed], default: [] },
    lastTrade: { type: Schema.Types.Mixed, default: null },
    aiThought: { type: String },
    decisionHistory: { type: [Schema.Types.Mixed], default: [] },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

// Add auto-generated ID
AgentSchema.virtual("agentId").get(function () {
  return this._id.toString();
});

AgentSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const Agent = mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);

