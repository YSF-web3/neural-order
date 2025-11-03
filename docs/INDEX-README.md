# Automated Trading Bot - Main Entry Point

## Overview

`index.js` is your **main automated trading bot** that runs continuously, making AI-driven trading decisions every minute.

## Features

✅ **Runs every 1 minute** - Continuous monitoring and trading  
✅ **AI-driven decisions** - Uses OpenAI to analyze market opportunities  
✅ **Automatic position management** - Closes positions based on stop loss, take profit, or AI signals  
✅ **Comprehensive logging** - Detailed logs of every action  
✅ **Profit tracking** - Tracks trades, profits, and statistics  
✅ **Multi-symbol trading** - Scans all perpetual futures and trades best opportunities  
✅ **Risk management** - Respects position limits, confidence thresholds, and balance  

## How It Works

### Every Minute, the Bot:

1. **Checks Balance** - Verifies available USDT
2. **Manages Positions** - Analyzes existing positions and closes if needed
3. **Scans Market** - Finds top trading opportunities
4. **AI Analysis** - Uses OpenAI to analyze each opportunity
5. **Opens Positions** - Trades on high-confidence signals (>75%)
6. **Logs Everything** - Comprehensive logging of all actions

## Usage

### Start the Bot

```bash
node index.js
```

The bot will:
- Start immediately
- Run a trading cycle
- Then repeat every 60 seconds
- Log everything comprehensively

### Stop the Bot

Press `Ctrl+C` to stop gracefully. It will show final statistics.

## Configuration

Edit `index.js` to customize:

```javascript
const CONFIG = {
  checkInterval: 60000,        // Check every 1 minute
  maxPositions: 5,              // Max 5 concurrent positions
  minConfidence: 0.75,          // Min 75% confidence
  minVolume: 50000,             // Min $50k volume
  maxSymbolsToAnalyze: 10,      // Analyze top 10 symbols
  positionSizePercent: 0.10,    // Use 10% of balance per position
  stopLossPercent: 0.02,        // 2% stop loss
  takeProfitPercent: 0.05,      // 5% take profit
  enableTrading: false          // Set to true to enable trading
};
```

## Enable Trading

**IMPORTANT:** Trading is disabled by default (simulation mode).

To enable actual trading:

1. Edit `index.js`
2. Change `enableTrading: false` to `enableTrading: true`
3. Run the bot

⚠️ **Warning:** Only enable after thorough testing!

## What Gets Logged

Every session logs:

- ✅ Account balance
- ✅ Active positions
- ✅ Position analysis (PnL, entry, current price)
- ✅ AI signals and decisions
- ✅ Position closures (with reasons)
- ✅ New opportunities found
- ✅ Positions opened
- ✅ Trading statistics
- ✅ Profit/loss tracking

## Example Output

```
════════════════════════════════════════════════════════════════════════════════
TRADING SESSION #1 - 11/3/2025, 7:17:25 PM
════════════════════════════════════════════════════════════════════════════════

Step 1: Checking account balance...
Available Balance: $21.54 USDT
Wallet Balance: $12.00 USDT

Step 2: Checking current positions...
Active Positions: 0/5

Step 3: Managing existing positions...
No active positions to manage

Step 4: Finding new opportunities (5 slots available)...
Analyzing BTCUSDT (1/10)...
  AI Decision: NO_ACTION (confidence: 20.0%)
Analyzing ETHUSDT (2/10)...
  AI Decision: BUY (confidence: 78.5%)
  ✅ Added to opportunities queue

Step 5: Opening new positions...
  Opening position: BUY 0.002 ETHUSDT
  Position value: $7.33
  Confidence: 78.5%

════════════════════════════════════════════════════════════════════════════════
SESSION SUMMARY
════════════════════════════════════════════════════════════════════════════════
Current Balance: $12.00 USDT
Available Balance: $4.67 USDT
Unrealized PnL: $0.00 USDT
Active Positions: 1/5
Signals Analyzed: 2
```

## Statistics Tracked

- Total sessions run
- Total trades executed
- Positions opened
- Positions closed
- Profitable trades
- Losing trades
- Total profit/loss
- Uptime

## Position Closing Logic

Positions are automatically closed when:

1. **Stop Loss Hit** - Loss exceeds 2% (configurable)
2. **Take Profit Hit** - Profit exceeds 5% (configurable)
3. **AI Signal** - AI recommends closing (>75% confidence)
4. **Cut Loss** - Losing position and AI strongly recommends (>80% confidence)

## Safety Features

- ✅ Trading disabled by default
- ✅ Minimum confidence threshold
- ✅ Position size limits
- ✅ Max positions limit
- ✅ Balance checks
- ✅ Comprehensive error handling

## Files Used

- `index.js` - Main bot (you are here)
- `futures-trading.js` - Trading functions
- `market-data-collector.js` - Market data collection
- `openai-trading.js` - AI signal generation
- `multi-symbol-bot.js` - Symbol scanning
- `symbol-utils.js` - Symbol precision helpers

## Best Practices

1. **Test first** - Run with `enableTrading: false` initially
2. **Monitor logs** - Watch what decisions are made
3. **Start small** - Use small position sizes initially
4. **Review regularly** - Check statistics and performance
5. **Adjust config** - Tune based on your risk tolerance

## Next Steps

1. ✅ Bot is ready to run
2. ⚠️ Test with simulation mode first (`enableTrading: false`)
3. ⚠️ Monitor logs and decisions
4. ⚠️ Enable trading when ready (`enableTrading: true`)
5. ⚠️ Run 24/7 for continuous trading

Your automated trading bot is ready! 🚀

