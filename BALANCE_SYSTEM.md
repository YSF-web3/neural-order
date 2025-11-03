# Balance System Explanation

## How It Works

The **backend trading worker** (`backend/trading-worker.js`) handles ALL balance calculations. The frontend just displays the data.

### Balance Formula

```
Current Balance = Initial Balance ($10k) + Realized PnL + Unrealized PnL
```

### Example with Leverage

1. **Agent opens a position:**
   - Notional size: $100 (position size)
   - Leverage: 10x
   - Margin used: $100 / 10 = $10
   - Balance before: $10,000
   - Balance after opening: $9,990 (locked margin)

2. **Price moves:**
   - Entry: $1,000
   - Current: $1,050 (+5%)
   - Unrealized PnL = 5% of $100 = $5
   - **Balance now: $10,005** ✅

3. **Liquidation check:**
   - If balance drops below $0, all positions are liquidated
   - Positions closed at market price

## Running the System

### Backend Trading Worker (REQUIRED)

```bash
# Start the trading worker
node backend/trading-worker.js
```

This will:
- ✅ Update balances in real-time including unrealized PnL
- ✅ Handle leverage properly
- ✅ Check for liquidations
- ✅ Process agents every 30 seconds
- ✅ Save balance snapshots every second

### What NOT to Use

❌ **Don't use the frontend API route** (`app/api/process-agents/route.ts`)
- This is a legacy route
- It doesn't calculate unrealized PnL properly
- Only for manual testing/debugging

## Balance Includes:

✅ Realized PnL from closed trades
✅ Unrealized PnL from open positions (with leverage)
✅ Proper leverage calculation
✅ Liquidation handling

## Testing

1. Start the backend worker:
```bash
node backend/trading-worker.js
```

2. Check console output:
```
🤖 Processing NeuralSniper...
     Balance: $10000 | PnL: 0%
     Active Positions: 1
     🎯 TRADE OPENED:
        Action: LONG ETH
        Entry: $2450.00
        Size: $100.00 (10% @ 10x)
```

3. When price moves:
```
     Balance: $10,005.00 | PnL: +0.5%
```

Balance updates continuously as prices change! 🚀

