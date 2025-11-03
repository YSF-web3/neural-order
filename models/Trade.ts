/**
 * Trade Model
 * MongoDB schema for simulated trades
 * Stores individual trade events (both entry and exit)
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ITrade extends Document {
  agentId: string;
  agentName: string;
  pair: string;
  side: "long" | "short";
  amount: number;
  price: number;
  pnl: number;
  pnlAbsolute: number;
  timestamp: number;
  tradeType: "entry" | "exit"; // Track if this is an entry or exit trade
  leverage: number;
  size_usd: number;
  sizePct?: number;
  confidence: number;
  aiReason?: string;
  orderType: string;
  createdAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    pair: { type: String, required: true },
    side: { type: String, enum: ["long", "short"], required: true },
    amount: { type: Number, required: true },
    price: { type: Number, required: true },
    pnl: { type: Number, required: true },
    pnlAbsolute: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    tradeType: { type: String, enum: ["entry", "exit"], default: "entry" },
    leverage: { type: Number, default: 1 },
    size_usd: { type: Number, required: true },
    sizePct: { type: Number },
    confidence: { type: Number, default: 0.5 },
    aiReason: { type: String },
    orderType: { type: String, default: "market" },
  },
  { timestamps: true }
);

TradeSchema.index({ agentId: 1, timestamp: -1 });
TradeSchema.index({ timestamp: -1 });
TradeSchema.index({ agentId: 1, tradeType: 1 });

export const Trade = mongoose.models.Trade || mongoose.model<ITrade>("Trade", TradeSchema);

