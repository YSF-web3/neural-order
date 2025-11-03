/**
 * API Route: /api/positions
 * Fetches open and closed positions
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Position } from "@/models/Position";

/**
 * GET /api/positions
 * Fetch positions from the database
 * Can filter by agentId, status, or both
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const status = searchParams.get("status"); // "open" or "closed"
    const limit = parseInt(searchParams.get("limit") || "100");

    // Build query
    let query: any = {};
    
    if (agentId) {
      query.agentId = agentId;
    }
    
    if (status) {
      query.status = status;
    }

    const positions = await Position.find(query)
      .sort({ opened_at: -1 })
      .limit(limit);

    return NextResponse.json({ positions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}

