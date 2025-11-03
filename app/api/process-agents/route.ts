/**
 * API Route: /api/process-agents
 * FRONTEND IS READ-ONLY - This route is disabled
 * All trading is handled by backend/trading-worker.js
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { 
      message: "Frontend is read-only. Use backend/trading-worker.js for processing agents.",
      note: "Start the backend worker with: node backend/trading-worker.js"
    },
    { status: 200 }
  );
}

