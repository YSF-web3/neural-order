# Multi-Symbol Trading Bot Guide

## Overview

Your trading bot now scans **ALL perpetual futures tokens** on Aster Exchange and trades the best opportunities!

## What Changed

### Before
- Only traded BTCUSDT
- Fixed to one symbol

### Now
- ✅ Scans **140+ perpetual futures symbols**
- ✅ Scores symbols by opportunity
- ✅ Analyzes top symbols with AI
- ✅ Trades multiple symbols simultaneously
- ✅ Manages max positions limit

## How It Works

1. **Gets all symbols** - Fetches all PERPETUAL futures from exchange
2. **Screens by volume** - Filters symbols with minimum liquidity
3. **Scores opportunities** - Ranks by volume, volatility, price movement
4. **AI analysis** - Analyzes top symbols with OpenAI
5. **Trades best signals** - Executes trades on high-confidence signals

## Files

- **`multi-symbol-bot.js`** - Multi-symbol trading bot
- **`trading-bot-example.js`** - Updated to use multi-symbol mode

## Usage

### Basic Usage

```bash
node multi-symbol-bot.js
```

### With Custom Settings

```javascript
const { multiSymbolTradingBot } = require('./multi-symbol-bot');

multiSymbolTradingBot({
  maxSymbols: 10,        // Analyze top 10 symbols
  minConfidence: 0.7,    // Minimum AI confidence to trade
  minVolume: 50000,      // Minimum 24h volume in USDT
  maxPositions: 5        // Max concurrent positions
});
```

### Continuous Mode

```javascript
const { runContinuous } = require('./multi-symbol-bot');

runContinuous({
  maxSymbols: 10,
  minConfidence: 0.7,
  minVolume: 50000,
  maxPositions: 5,
  scanInterval: 300000  // Scan every 5 minutes
});
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `maxSymbols` | 10 | Number of symbols to analyze |
| `minConfidence` | 0.7 | Minimum AI confidence (0.0-1.0) |
| `minVolume` | 50000 | Minimum 24h volume in USDT |
| `maxPositions` | 5 | Maximum concurrent positions |
| `scanInterval` | 300000 | Scan interval in ms (for continuous mode) |

## Symbol Scoring

Symbols are scored based on:

1. **Volume** - Higher volume = better liquidity
2. **Volatility** - Moderate volatility (1-5%) = sweet spot
3. **Price Movement** - Strong moves = opportunity

Top-scored symbols are analyzed first.

## Example Output

```
🤖 Multi-Symbol Trading Bot Starting...

📋 Step 1: Getting all perpetual futures symbols...
   Found 140 perpetual futures symbols

📊 Step 2: Getting 24hr market data for screening...
   Retrieved data for 214 symbols

🎯 Step 3: Scoring symbols by opportunity...
   Top 10 symbols by opportunity:

   1. ETHUSDT: Score 97.1, 24h Change: -4.49%
   2. BTCUSDT: Score 91.4, 24h Change: -2.66%
   3. HEMIUSDT: Score 80.9, 24h Change: -8.49%
   ...

🧠 Step 5: Analyzing symbols with AI...
   Analyzing ETHUSDT: BUY signal (confidence: 85%)
   Analyzing BTCUSDT: NO_ACTION (confidence: 45%)
   ...
```

## Features

✅ **Automatic symbol discovery** - Finds all trading pairs  
✅ **Smart filtering** - Only analyzes liquid symbols  
✅ **Opportunity scoring** - Ranks by trading potential  
✅ **AI analysis** - Uses OpenAI for each symbol  
✅ **Position management** - Respects max positions limit  
✅ **Risk management** - Checks balance and risk limits  

## Safety Features

- ✅ Minimum volume filter (avoids illiquid pairs)
- ✅ Maximum positions limit
- ✅ Confidence threshold
- ✅ Risk checks before each trade
- ✅ Execution disabled by default

## To Enable Trading

Edit `multi-symbol-bot.js` around line 200 and uncomment:

```javascript
// UNCOMMENT TO ACTUALLY EXECUTE TRADES:
const { placeMarketOrder } = require('./futures-trading');
if (sig.signal.action === 'BUY') {
  const order = await placeMarketOrder(sig.symbol, 'BUY', positionSize);
  console.log(`✅ Order placed! Order ID: ${order.orderId}`);
}
```

## Best Practices

1. **Start small** - Use `maxSymbols: 5` initially
2. **Monitor results** - Watch signals before enabling execution
3. **Set limits** - Use reasonable `maxPositions` (3-5)
4. **Filter by volume** - Higher `minVolume` = safer trades
5. **Test first** - Run without execution enabled first

## Cost Considerations

- **API calls**: ~1-2 calls per symbol analyzed
- **OpenAI calls**: 1 call per symbol analyzed
- **Cost per scan**: ~$0.001-0.002 per symbol (OpenAI)

For 10 symbols: ~$0.01-0.02 per scan

## Next Steps

1. ✅ Multi-symbol bot is ready
2. ⚠️ Test with small `maxSymbols` first
3. ⚠️ Monitor AI signals
4. ⚠️ Enable execution when ready
5. ⚠️ Consider continuous mode for 24/7 trading

Your bot now trades across the entire market, not just BTC! 🚀

