# Aster Futures Trading Bot

A comprehensive Node.js library for automated futures trading on Aster Exchange.

## Features

✅ **Futures-only trading** - Focused on futures contracts  
✅ **Order placement** - Market, Limit, Stop Loss, Take Profit orders  
✅ **Position management** - Track and manage your positions  
✅ **Market data** - Real-time prices, order book, ticker data  
✅ **Risk management** - Built-in risk checks and position sizing  
✅ **Web3 signing** - Uses Aster's v3 Pro API with Web3 authentication  

## Files

- **`futures-trading.js`** - Core trading library with all API functions
- **`trading-bot-example.js`** - Example trading bot showing how to use the library

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your API Credentials

Edit `futures-trading.js` and update:

```javascript
const config = {
  futuresV3: {
    user: 'YOUR_MAIN_ACCOUNT_ADDRESS',
    signer: 'YOUR_API_WALLET_ADDRESS',
    signerPrivateKey: 'YOUR_API_WALLET_PRIVATE_KEY',
    baseURL: 'https://fapi.asterdex.com'
  }
};
```

### 3. Run the Example

```bash
# Check account status
node futures-trading.js

# Run example trading bot
node trading-bot-example.js
```

## Core Functions

### Account & Positions

```javascript
const { getBalance, getPositions, getOpenOrders } = require('./futures-trading');

// Get account balance
const balance = await getBalance();

// Get current positions
const positions = await getPositions('BTCUSDT');

// Get open orders
const orders = await getOpenOrders('BTCUSDT');
```

### Market Data

```javascript
const { getPrice, get24hrTicker, getOrderBook } = require('./futures-trading');

// Get current price
const price = await getPrice('BTCUSDT');
console.log(`BTC Price: $${price.price}`);

// Get 24hr statistics
const ticker = await get24hrTicker('BTCUSDT');
console.log(`24h Change: ${ticker.priceChangePercent}%`);

// Get order book
const orderBook = await getOrderBook('BTCUSDT', 10);
```

### Placing Orders

```javascript
const { placeMarketOrder, placeLimitOrder } = require('./futures-trading');

// Market order (immediate execution)
const order = await placeMarketOrder('BTCUSDT', 'BUY', '0.001');

// Limit order (better price, but might not fill)
const limitOrder = await placeLimitOrder('BTCUSDT', 'BUY', '0.001', '50000', 'BOTH', 'GTC');
```

### Risk Management

```javascript
const { checkRiskLimits, calculatePositionSize } = require('./futures-trading');

// Check if order is safe to place
const riskCheck = await checkRiskLimits('BTCUSDT', '0.001', '50000');
if (riskCheck.allowed) {
  // Place order
} else {
  console.log(`Risk check failed: ${riskCheck.reason}`);
}

// Calculate position size based on risk
const balance = 1000; // USDT
const price = 50000; // BTC price
const positionSize = calculatePositionSize(balance, price, 0.1); // 10% risk
```

## Building Your Trading Bot

### Basic Structure

```javascript
const {
  getPrice,
  getBalance,
  getPositions,
  placeMarketOrder,
  checkRiskLimits,
  calculatePositionSize
} = require('./futures-trading');

async function tradingBot() {
  // 1. Get market data
  const price = await getPrice('BTCUSDT');
  
  // 2. Run your AI/strategy
  const signal = await yourAIModel.predict(price);
  
  // 3. Check risk limits
  const riskCheck = await checkRiskLimits('BTCUSDT', signal.quantity, price.price);
  
  // 4. Place order if approved
  if (riskCheck.allowed && signal.action === 'BUY') {
    await placeMarketOrder('BTCUSDT', 'BUY', signal.quantity);
  }
}

// Run continuously
setInterval(tradingBot, 5000); // Every 5 seconds
```

### Risk Management

The library includes built-in risk management:

```javascript
const riskConfig = {
  maxPositionSize: 0.1,        // Max 10% per trade
  maxDailyLoss: 0.05,          // Stop if lose 5%
  maxLeverage: 3,              // Max 3x leverage
  stopLossPercent: 0.02,       // 2% stop loss
  takeProfitPercent: 0.05,      // 5% take profit
  maxOpenPositions: 5           // Max 5 positions
};
```

### Order Types

1. **Market Order** - Immediate execution at current price
2. **Limit Order** - Execute at specific price or better
3. **Stop Loss** - Automatic stop loss order
4. **Take Profit** - Automatic take profit order

## Example: Simple Trading Bot

See `trading-bot-example.js` for a complete example showing:
- Getting market data
- Checking account balance
- Running AI signals
- Placing orders with risk checks
- Managing positions

## Safety Features

- ✅ Risk limits checking before orders
- ✅ Position size calculation
- ✅ Stop loss and take profit helpers
- ✅ Balance validation
- ✅ Error handling

## Best Practices

1. **Start Small** - Test with small amounts first
2. **Use Stop Losses** - Always set stop losses
3. **Monitor Positions** - Check positions regularly
4. **Set Limits** - Use max position size and daily loss limits
5. **Test First** - Test your strategy before going live

## API Endpoints Used

- `GET /fapi/v3/balance` - Account balance
- `GET /fapi/v3/positionRisk` - Current positions
- `GET /fapi/v3/openOrders` - Open orders
- `POST /fapi/v3/order` - Place order
- `DELETE /fapi/v3/order` - Cancel order
- `GET /fapi/v3/ticker/price` - Current price
- `GET /fapi/v3/ticker/24hr` - 24hr statistics
- `GET /fapi/v3/depth` - Order book

## Next Steps

1. Customize `trading-bot-example.js` with your AI logic
2. Add your strategy signals
3. Test thoroughly with small amounts
4. Monitor performance
5. Scale up gradually

## Support

For API documentation, see:
- `aster-finance-futures-api-v3.md` - Full API reference

