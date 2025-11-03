/**
 * Trading Cron - Runs every 30 seconds
 * Processes all agents for paper trading
 */

// This will be called by an external service or internal scheduler
// For now, we can use an API endpoint that gets called every 30s

export function startTradingCron() {
  // TODO: Set up actual cron job using node-cron or external service
  
  console.log("🚀 Trading cron initialized - processing agents every 30s");
  
  // For development: Use setInterval
  if (typeof window === "undefined") {
    // Server-side only
    setInterval(async () => {
      try {
        const response = await fetch("http://localhost:3000/api/process-agents");
        const data = await response.json();
        console.log("✓ Processed agents:", data.processed, "at", new Date().toISOString());
      } catch (error) {
        console.error("Error in trading cron:", error);
      }
    }, 30000); // 30 seconds
  }
}

