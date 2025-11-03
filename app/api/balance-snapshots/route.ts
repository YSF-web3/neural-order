/**
 * API Route: /api/balance-snapshots
 * Fetches and saves balance snapshot history
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BalanceSnapshot } from "@/models/BalanceSnapshot";
import { Agent } from "@/models/Agent";

/**
 * GET /api/balance-snapshots
 * Fetch historical balance snapshots for chart
 * Supports time range filtering
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const hoursParam = searchParams.get("hours");
    const allParam = searchParams.get("all");
    const agentId = searchParams.get("agentId"); // Optional filter by agent

    const isAllTime = (hoursParam === "all") || (allParam === "true");
    const hours = isAllTime ? undefined : parseInt(hoursParam || "1"); // Default: last hour

    // Build query (all-time means no timestamp cutoff)
    let query: any = {};
    if (!isAllTime && typeof hours === 'number' && !Number.isNaN(hours)) {
      const now = Date.now();
      const cutoffTime = now - (hours * 60 * 60 * 1000);
      query.timestamp = { $gte: cutoffTime };
    }
    
    if (agentId) {
      query.agentId = agentId;
    }

    // Fetch all snapshots within the time range
    // For 24 hours with multiple agents, this could be large but necessary for full chart
    const snapshots = await BalanceSnapshot.find(query)
      .sort({ timestamp: 1 })
      // No limit - fetch all data to show complete evolution
    
    console.log(`📊 Fetched ${snapshots.length} snapshots ${isAllTime ? '(all-time)' : `for ${hours} hours`}`);

    return NextResponse.json({ snapshots }, { status: 200 });
  } catch (error) {
    console.error("Error fetching balance snapshots:", error);
    return NextResponse.json(
      { error: "Failed to fetch balance snapshots" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/balance-snapshots
 * Save current balance snapshots for all agents
 * Called periodically by the backend trading worker
 * Frontend should only use GET - do not call POST from frontend
 */
export async function POST() {
  try {
    await connectDB();
    
    // Get all agents
    const agents = await Agent.find({});
    
    if (agents.length === 0) {
      return NextResponse.json({ message: "No agents found" }, { status: 200 });
    }

    const timestamp = Date.now();
    const snapshots = [];

    // Create snapshot for each agent
    for (const agent of agents) {
      const snapshot = await BalanceSnapshot.create({
        timestamp,
        agentId: agent._id.toString(),
        agentName: agent.name,
        balance: agent.balance || 1000,
        pnl: agent.pnl || 0,
        pnlAbsolute: agent.pnlAbsolute || 0,
      });
      
      snapshots.push(snapshot);
    }

    // Clean up old snapshots (keep last 24 hours)
    const cutoffTime = timestamp - (24 * 60 * 60 * 1000);
    await BalanceSnapshot.deleteMany({ timestamp: { $lt: cutoffTime } });

    return NextResponse.json({ 
      snapshots: snapshots.length,
      timestamp 
    }, { status: 200 });
  } catch (error) {
    console.error("Error saving balance snapshots:", error);
    return NextResponse.json(
      { error: "Failed to save balance snapshots" },
      { status: 500 }
    );
  }
}

