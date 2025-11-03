/**
 * Balance Snapshot Model
 * Stores historical balance snapshots for chart persistence
 * Saves one snapshot per second for time-series chart data
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IBalanceSnapshot extends Document {
  timestamp: number; // Unix timestamp in milliseconds
  agentId: string;
  agentName: string;
  balance: number;
  pnl: number; // Percentage
  pnlAbsolute: number; // USD
  createdAt: Date;
}

const BalanceSnapshotSchema = new Schema<IBalanceSnapshot>(
  {
    timestamp: { type: Number, required: true },
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    balance: { type: Number, required: true },
    pnl: { type: Number, default: 0 },
    pnlAbsolute: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for efficient querying by timestamp and agent
BalanceSnapshotSchema.index({ timestamp: -1, agentId: 1 });
BalanceSnapshotSchema.index({ timestamp: -1 });

export const BalanceSnapshot = mongoose.models.BalanceSnapshot || mongoose.model<IBalanceSnapshot>("BalanceSnapshot", BalanceSnapshotSchema);

