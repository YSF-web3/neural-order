# Frontend Real Data Integration

## Overview
The frontend now displays real data from the trading worker and database, showing actual agent balances, trades, and positions.

## Key Changes

### 1. API Client Updates (`lib/api-client.ts`)

**Before:** Used simulated data
**After:** Fetches real data from MongoDB

#### Updated Functions:

**`fetchAgents()`**
- Fetches agents from `/api/agents`
- Maps database format to frontend format
- Includes real balance, PnL, win rate, and trade counts from the database

**`simulateActivity()`** 
- Renamed from "simulate" to fetch real updates
- Now fetches latest agents and trades from the database
- No longer generates fake data

**`fetchTrades()`**
- Maps database trade records to frontend format
- Returns only exit trades (completed positions)
- Includes proper ID mapping

### 2. Trades API Updates (`app/api/trades/route.ts`)

**Key Change:** Only returns `tradeType: "exit"` trades
- Entry trades are not shown in the feed
- Only completed positions appear in the live feed
- Provides cleaner, more relevant data

### 3. Main Dashboard Updates (`app/page.tsx`)

**Polling Interval:**
- Changed from 3 seconds to 5 seconds
- Better aligned with trading worker (runs every 30 seconds)
- Reduced unnecessary API calls

**Data Flow:**
1. Initial load fetches agents and trades
2. Balance history updates with real balance values
3. Every 5 seconds, fetches latest data from backend

### 4. Live Feed Updates (`components/arena/LiveFeed.tsx`)

**Display Improvements:**
- Shows amount with 2 decimal places
- Better formatting for PnL display
- Uses real trade data from database
- Only shows completed trades (exits)

## Real Data Fields

### Agents Display:
- **Balance**: Computed from trades and positions
- **PnL**: Calculated from realized PnL
- **Win Rate**: From completed trades
- **Total Trades**: Count of exit trades
- **Volume 24h**: Sum of size_usd from trades in last 24h
- **Active Positions**: Real open positions from database

### Trades Feed:
- **Agent Name**: From actual trade records
- **Pair**: Trading pair (e.g., "BTC", "ETH")
- **Side**: "long" or "short"
- **Amount**: Trade amount
- **Price**: Entry/exit price
- **PnL**: Realized PnL from closed position
- **Timestamp**: When the trade occurred

## How It Works

### Data Flow:

```
Trading Worker (backend/trading-worker.js)
    ↓
    Stores trades in MongoDB
    ↓
    Updates agent balances
    ↓
Frontend polls /api/agents every 5s
    ↓
    Displays real balances and trades
```

### Example Data:

**Agent:**
```typescript
{
  name: "NeuralSniper",
  balance: 12450.25,  // Real balance from trades
  pnl: 24.5,         // Percentage PnL
  winRate: 68.3,      // From completed trades
  totalTrades: 42,    // Exit trade count
  volume24h: 125000,  // 24h trade volume
  activePositions: [...], // Open positions
}
```

**Trade:**
```typescript
{
  agentName: "NeuralSniper",
  pair: "ETH",
  side: "long",
  amount: 2.5,
  price: 2450.50,
  pnl: 3.2,          // Realized PnL %
  timestamp: 1698765432000,
}
```

## Benefits

1. **Real-time Accuracy**: Shows actual trading activity
2. **Consistent Data**: Balance computed from trades, not simulated
3. **Complete History**: Every completed trade is recorded
4. **Live Updates**: Balance changes reflect actual market movements
5. **Audit Trail**: Full trade history with AI reasoning

## Testing

To verify real data is showing:

1. **Check Browser Console:**
   ```javascript
   // Should see real agent data
   console.log('Agents loaded:', agents.length);
   ```

2. **Monitor Network Tab:**
   - `/api/agents` returns database data
   - `/api/trades` returns exit trades only
   - Balance values update based on trades

3. **Compare with Database:**
   ```javascript
   // Check balance calculation
   const agent = agents[0];
   console.log('Balance:', agent.balance);
   console.log('PnL:', agent.pnl);
   console.log('Trades:', agent.totalTrades);
   ```

## Next Steps

- [x] Updated API client to fetch real data
- [x] Updated trades API to filter exit trades
- [x] Updated frontend polling interval
- [x] Improved trade display formatting
- [ ] Add agent detail page with full trade history
- [ ] Add charts for individual agents
- [ ] Add position tracking display

