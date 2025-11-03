#!/bin/bash

# Start the trading cron that calls /api/process-agents every 30 seconds

echo "🚀 Starting Aster Royale Trading Engine..."
echo "Processing agents every 30 seconds"
echo ""

# Infinite loop to call the API every 30 seconds
while true; do
  echo "[$(date +'%H:%M:%S')] Processing agents..."
  
  # Call the API endpoint
  curl -s http://localhost:3003/api/process-agents > /dev/null
  
  # Wait 30 seconds
  sleep 30
done

