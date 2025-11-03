# Position Manager Guide

## Overview

Your trading bot now has a **continuous position management system** that:
- ✅ Checks positions every 1 minute
- ✅ Monitors and analyzes all open positions
- ✅ Closes positions automatically (stop loss, take profit, AI signals)
- ✅ Opens new positions when opportunities arise
- ✅ Manages risk across all positions

## How It Works

### Position Monitoring Loop

1. **Every 1 minute** (configurable):
   - Checks all open positions
   - Analyzes each position with AI
   - Decides if positions should be closed
   - Finds new trading opportunities
   - Opens new positions if slots available

### Position Analysis

For each position, the system checks:

1. **Stop Loss** - Closes if loss exceeds threshold (default: 2%)
2. **Take Profit** - Closes if profit exceeds target (default: 5%)
3. **AI Signal** - Closes if AI recommends opposite direction (>75% confidence)
4. **Liquidation Risk** - Closes if getting too close to liquidation price
5. **Cut Loss** - Closes losing positions if AI strongly recommends (>80% confidence)

### New Position Opening

When positions are closed and slots become available:
1. Scans market for opportunities
2. Scores symbols by volume, volatility, price movement
3. Analyzes with AI
4. Opens positions on high-confidence signals (>75%)

## Usage

### Basic Usage

```bash
node position-manager.js
```

### Custom Configuration

```javascript
const { managePositions } = require('./position-manager');

managePositions({
  checkInterval: 60000,      // Check every 1 minute
  maxPositions: 5,            // Max 5 concurrent positions
  minConfidence: 0.75,        // Min 75% confidence for new positions
  minVolume: 50000            // Min $50k volume for opportunities
});
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `checkInterval` | 60000 | Check interval in milliseconds (1 minute) |
| `maxPositions` | 5 | Maximum concurrent positions |
| `minConfidence` | 0.75 | Minimum AI confidence (0.0-1.0) |
| `minVolume` | 50000 | Minimum 24h volume in USDT |

## Position Closing Logic

Positions are closed when:

1. **Stop Loss Hit** - Loss exceeds 2% (configurable)
2. **Take Profit Hit** - Profit exceeds 5% (configurable)
3. **AI Signal** - AI recommends closing (>75% confidence)
4. **Cut Loss** - Losing position and AI strongly recommends closing (>80%)
5. **Liquidation Risk** - Price getting too close to liquidation (<5% away)

## Example Output

```
🤖 Position Manager Starting...

🔄 Position Check - 2:22:25 PM

📊 Current Positions: 2/5

BTCUSDT:
   Position: LONG 0.001
   Entry: $107000.00
   Current: $108000.00
   PnL: $100.00 (0.93%)
   AI Signal: HOLD (65.0%)
   Recommendation: HOLD

ETHUSDT:
   Position: LONG 0.1
   Entry: $3600.00
   Current: $3500.00
   PnL: $-10.00 (-2.78%)
   AI Signal: SELL (82.0%)
   Recommendation: CLOSE
   ⚠️  Should close: AI_SIGNAL

🔴 Closing 1 position(s)...
   Closing ETHUSDT: AI_SIGNAL

🔍 Looking for new opportunities (1 slot available)...
   Found SOLUSDT opportunity (confidence: 78%)
   Opening new position...
```

## Features

✅ **Continuous Monitoring** - Runs 24/7, checks every minute  
✅ **AI-Driven Decisions** - Uses OpenAI for all decisions  
✅ **Automatic Closing** - Closes positions based on multiple criteria  
✅ **Automatic Opening** - Opens new positions when opportunities arise  
✅ **Risk Management** - Respects max positions and confidence thresholds  
✅ **Multiple Strategies** - Stop loss, take profit, AI signals  

## Integration

### Use with Multi-Symbol Bot

```javascript
// Start position manager
const { managePositions } = require('./position-manager');
managePositions();

// Or run initial scan first
const { multiSymbolTradingBot } = require('./multi-symbol-bot');
await multiSymbolTradingBot({ maxSymbols: 10 });
```

### Use as Standalone

```bash
# Just run the position manager
node position-manager.js
```

## Safety Features

- ✅ Execution disabled by default
- ✅ Multiple confirmation checks before closing
- ✅ Position size limits
- ✅ Max positions limit
- ✅ Confidence thresholds
- ✅ Volume filters

## To Enable Execution

Edit `position-manager.js` and uncomment:

### For Closing Positions:
```javascript
// Around line 85
const order = await placeMarketOrder(symbol, side, positionAmt, positionSide, true);
```

### For Opening Positions:
```javascript
// Around line 180
const order = await placeMarketOrder(symbol, signal.action, positionSize);
```

## Best Practices

1. **Start with longer intervals** - Use 5 minutes initially
2. **Lower max positions** - Start with 2-3 positions
3. **Higher confidence** - Use 0.8+ for new positions
4. **Monitor first** - Run without execution enabled
5. **Test thoroughly** - Paper trade before going live

## Cost Considerations

- **API calls**: ~2-3 per symbol per check
- **OpenAI calls**: 1 per position + 1 per opportunity
- **Cost per minute**: ~$0.01-0.02 (with 5 positions)

## Workflow

```
Every 1 minute:
  1. Check all positions
  2. Analyze with AI
  3. Close if needed (stop loss, take profit, AI signal)
  4. Find new opportunities
  5. Open new positions if slots available
  6. Wait 1 minute
  7. Repeat
```

## Next Steps

1. ✅ Position manager is ready
2. ⚠️ Test with monitoring only first
3. ⚠️ Enable execution when ready
4. ⚠️ Adjust intervals and thresholds
5. ⚠️ Run 24/7 for continuous trading

Your bot now manages positions automatically! 🚀

