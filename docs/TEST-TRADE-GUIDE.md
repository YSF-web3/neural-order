# How to Test Trade Execution

## Quick Guide

### 1. Run the Test Script

```bash
node test-trade-execution.js
```

This runs all tests without actually placing orders (safe mode).

### 2. Test Individual Functions

```javascript
const {
  testMarketOrder,
  testVerifyOrder,
  testVerifyPosition,
  testCancelOrder
} = require('./test-trade-execution');

// Test placing a market order
await testMarketOrder('BTCUSDT');

// Verify an order was placed
await testVerifyOrder(orderId, 'BTCUSDT');

// Check if position was opened
await testVerifyPosition('BTCUSDT');

// Cancel a test order
await testCancelOrder(orderId, 'BTCUSDT');
```

## Step-by-Step Testing

### Step 1: Check Your Balance

```bash
node futures-trading.js
```

Make sure you have at least $10 USDT in your futures account.

### Step 2: Enable Order Execution

Edit `test-trade-execution.js` and uncomment the order placement code:

```javascript
// Find this line (around line 50):
// const order = await placeMarketOrder(symbol, 'BUY', positionSize);

// Uncomment it:
const order = await placeMarketOrder(symbol, 'BUY', positionSize);
```

### Step 3: Place a Test Order

```bash
node test-trade-execution.js
```

Or test just the market order:

```javascript
const { testMarketOrder } = require('./test-trade-execution');
await testMarketOrder('BTCUSDT');
```

### Step 4: Verify Order Was Placed

```javascript
const { testVerifyOrder } = require('./test-trade-execution');

// Check all open orders
await testVerifyOrder(null, 'BTCUSDT');

// Or check specific order by ID
await testVerifyOrder(12345678, 'BTCUSDT');
```

### Step 5: Verify Position Was Opened

```javascript
const { testVerifyPosition } = require('./test-trade-execution');
await testVerifyPosition('BTCUSDT');
```

### Step 6: Cancel Test Order (if needed)

```javascript
const { testCancelOrder } = require('./test-trade-execution');

// Cancel specific order
await testCancelOrder(orderId, 'BTCUSDT');

// Or cancel all open orders
await testCancelOrder(null, 'BTCUSDT');
```

## Manual Testing

### 1. Place Order Manually

```javascript
const { placeMarketOrder } = require('./futures-trading');

const order = await placeMarketOrder('BTCUSDT', 'BUY', '0.0001');
console.log('Order placed:', order.orderId);
```

### 2. Check Order Status

```javascript
const { getOrder } = require('./futures-trading');

const order = await getOrder('BTCUSDT', orderId);
console.log('Order status:', order.status);
console.log('Executed:', order.executedQty);
```

### 3. Check Position

```javascript
const { getPositions } = require('./futures-trading');

const positions = await getPositions('BTCUSDT');
const activePosition = positions.find(pos => {
  const positionAmt = parseFloat(pos.positionAmt);
  return positionAmt !== 0;
});

if (activePosition) {
  console.log('Position found:', activePosition.positionAmt);
  console.log('Entry Price:', activePosition.entryPrice);
  console.log('PnL:', activePosition.unRealizedProfit);
}
```

## What to Look For

### ✅ Order Placed Successfully

- Order ID returned
- Status: "NEW" (pending) or "FILLED" (executed)
- No errors

### ✅ Order Executed

- Status: "FILLED"
- Executed quantity > 0
- Average price filled

### ✅ Position Opened

- Position amount > 0 (for long) or < 0 (for short)
- Entry price set
- Unrealized PnL calculated

## Common Issues

### Issue: "Insufficient balance"
- **Fix**: Fund your futures account with more USDT

### Issue: "Order not found"
- **Fix**: Order might not have been placed, or order ID is wrong

### Issue: "No position found"
- **Fix**: Order might not have filled yet (wait a few seconds)

### Issue: "API error"
- **Fix**: Check your API credentials and network connection

## Safety Tips

1. ✅ **Start with small amounts** - Test with $5-10 first
2. ✅ **Test with limit orders** - Won't fill immediately, easier to cancel
3. ✅ **Monitor closely** - Watch orders and positions after placing
4. ✅ **Cancel test orders** - Don't leave test orders open
5. ✅ **Close test positions** - Close positions after testing

## Complete Test Flow

```javascript
const { testFullTradeFlow } = require('./test-trade-execution');

// Run complete test (place order, verify, check position)
await testFullTradeFlow('BTCUSDT');
```

This will:
1. Check balance
2. Check existing positions
3. Get current price
4. Place test order
5. Verify order
6. Check position

## Quick Commands

```bash
# Test everything
node test-trade-execution.js

# Check balance
node futures-trading.js

# Check positions
node margin-guide.js
```

Your test script is ready! Start with small amounts and verify everything works before going live. 🧪

