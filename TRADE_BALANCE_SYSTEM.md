# Trade & Balance System Documentation

## Overview
The trading system now properly stores all trades and calculates agent balances from historical trades and open positions.

## Key Components

### 1. Trade Storage
All trades are stored in MongoDB with complete information:
- **Entry Trades**: When an agent opens a position
- **Exit Trades**: When an agent closes a position

#### Trade Model (`models/Trade.ts`)
```typescript
interface ITrade {
  agentId: string;
  agentName: string;
  pair: string;
  side: "long" | "short";
  amount: number;
  price: number;
  pnl: number;
  pnlAbsolute: number;
  timestamp: number;
  tradeType: "entry" | "exit";
  leverage: number;
  size_usd: number;
  sizePct?: number;
  confidence: number;
  aiReason?: string;
  orderType: string;
}
```

### 2. Balance Calculation
Agent balance is now computed from trades and positions, not manually updated.

#### Balance Calculation Formula
```
Balance = Initial Balance ($10,000)
         + Realized PnL (from all exit trades)
         + Unrealized PnL (from open positions)
```

#### Balance Calculator (`lib/balance-calculator.ts`)

**Functions:**
- `getRealizedPnL(agentId)`: Sums all pnlAbsolute from exit trades
- `calculateUnrealizedPnL(positions, prices)`: Calculates current PnL for open positions
- `calculateAgentBalance(agent, marketData)`: Computes total balance
- `updateAgentBalance(agent, marketData)`: Updates balance and related metrics

### 3. Trading Worker Updates (`backend/trading-worker.js`)

#### Key Changes:
1. **Entry Trades are Stored**: When opening a position, an entry trade is saved
2. **Exit Trades are Stored**: When closing a position, an exit trade is saved
3. **Balance is Recalculated**: Before processing decisions and after closing positions
4. **Metrics are Calculated from Trades**:
   - Win rate: Winning trades / Total exit trades
   - Total trades: Count of exit trades
   - Volume 24h: Sum of size_usd from trades in last 24 hours

#### Example Flow:
```javascript
// 1. Update balance to reflect unrealized PnL from open positions
await updateAgentBalance(agent, marketData);

// 2. Generate AI decision
const aiDecision = await generateAIDecision(agent, marketData);

// 3. Execute trade (open/close)
if (action === 'close') {
  // ... save exit trade
  // ... recalculate balance
  await updateAgentBalance(agent, marketData);
}
```

### 4. Position Model Updates (`models/Position.ts`)

Added fields to match trading worker data:
- `sizePct`: Position size as percentage
- `aiReason`: AI's reasoning for the trade
- `orderType`: Type of order (market, limit, etc.)
- `side`: Buy or sell direction

## How It Works

### Opening a Position
1. AI generates a decision to open a position
2. Entry trade is saved to database (with pnl = 0)
3. Position is added to agent.activePositions
4. Position record is saved
5. Balance is updated to include unrealized PnL

### Closing a Position
1. AI generates a decision to close a position
2. PnL is calculated from entry/exit prices
3. Exit trade is saved to database (with realized PnL)
4. Position is removed from agent.activePositions
5. Closed position record is saved
6. Balance is recalculated from all trades and positions

### Balance Updates
Balance is updated:
- **Before each AI decision**: To show current unrealized PnL
- **After closing a trade**: To reflect realized PnL
- **Every 30 seconds**: When processing all agents

## API Endpoints

### GET `/api/trades`
Fetches recent trades with optional filters:
- `limit`: Number of trades to fetch (default: 20)
- `agentId`: Filter by specific agent

Returns all trades with complete information including:
- Entry and exit trades
- PnL data
- AI reasoning
- Confidence levels

## Benefits

1. **Accurate Balance**: Balance is always computed from actual trades
2. **Complete History**: Every trade is stored for analysis
3. **Real-time Updates**: Unrealized PnL updates with market prices
4. **Audit Trail**: Full trade history with AI reasoning
5. **Consistency**: No manual balance updates that can cause errors

## Testing

To verify the system is working:

1. **Check Trade Storage**:
   ```bash
   # Query database for trades
   db.trades.find().sort({timestamp: -1}).limit(10)
   ```

2. **Verify Balance Calculation**:
   - Start with $10,000 initial balance
   - Check that balance changes match closed trades
   - Verify unrealized PnL updates with market prices

3. **Monitor Logs**:
   ```bash
   # Watch trading worker output
   node backend/trading-worker.js
   ```

Look for log messages showing:
- Trade entries and exits
- Balance calculations
- PnL updates

