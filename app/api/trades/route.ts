/**
 * API Route: /api/trades
 * Fetches recent trades
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Trade } from "@/models/Trade";

/**
 * GET /api/trades
 * Fetch recent trades from the database
 * Returns ALL trades (both entry and exit) for the live feed
 * This allows users to see what each AI is doing in real-time
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const agentId = searchParams.get("agentId");
    const tradeType = searchParams.get("tradeType"); // Optional filter: "entry" or "exit"

    let query: any = {};
    
    if (agentId) {
      query.agentId = agentId;
    }
    
    // Only filter by tradeType if explicitly requested
    if (tradeType) {
      query.tradeType = tradeType;
    }

    const trades = await Trade.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({ trades }, { status: 200 });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

