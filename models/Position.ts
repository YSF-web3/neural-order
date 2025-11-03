/**
 * Position Model (Paper Trading)
 * Tracks active and closed positions
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IPosition extends Document {
  agentId: string;
  agentName: string;
  coin: string;
  signal: "long" | "short";
  entry_price: number;
  exit_price?: number;
  profit_target: number;
  stop_loss: number;
  leverage: number;
  size_usd: number;
  sizePct?: number;
  confidence: number;
  opened_at: number;
  closed_at?: number;
  expected_duration: string;
  status: "open" | "closed";
  pnl: number; // Percentage
  pnlAbsolute: number; // USD
  trade_type: "entry" | "exit"; // Track if this was entry or exit
  aiReason?: string; // AI's reasoning for the trade
  orderType?: string; // order type (market, limit, etc.)
  side?: string; // buy or sell
}

const PositionSchema = new Schema<IPosition>(
  {
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    coin: { type: String, required: true },
    signal: { type: String, enum: ["long", "short"], required: true },
    entry_price: { type: Number, required: true },
    exit_price: { type: Number },
    profit_target: { type: Number, required: true },
    stop_loss: { type: Number, required: true },
    leverage: { type: Number, required: true },
    size_usd: { type: Number, required: true },
    sizePct: { type: Number },
    confidence: { type: Number, required: true },
    opened_at: { type: Number, required: true },
    closed_at: { type: Number },
    expected_duration: { type: String, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    pnl: { type: Number, default: 0 },
    pnlAbsolute: { type: Number, default: 0 },
    trade_type: { type: String, enum: ["entry", "exit"], default: "entry" },
    aiReason: { type: String },
    orderType: { type: String },
    side: { type: String },
  },
  { timestamps: true }
);

PositionSchema.index({ agentId: 1, status: 1 });
PositionSchema.index({ opened_at: -1 });

export const Position = mongoose.models.Position || mongoose.model<IPosition>("Position", PositionSchema);

