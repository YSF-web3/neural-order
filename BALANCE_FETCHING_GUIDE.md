# Balance Fetching: API vs Calculation

## Quick Answer

**With real trading, you should ALWAYS fetch balance from Aster API, not calculate it manually.**

## Why Fetch from API?

### ✅ Advantages of Fetching from Aster API

1. **Single Source of Truth**: Aster exchange is the authority on your account balance
2. **Includes Everything**: Balance includes:
   - ✅ Realized PnL from closed trades
   - ✅ Unrealized PnL from open positions  
   - ✅ Trading fees
   - ✅ Funding fees
   - ✅ Margin requirements
   - ✅ Any other adjustments
3. **Always Accurate**: No risk of calculation errors
4. **Real-time**: Reflects the exact current state on the exchange
5. **Simple**: One API call instead of complex calculations

### ❌ Problems with Manual Calculation

1. **Missing Fees**: Hard to account for all fees accurately
2. **Funding Costs**: Funding fees are applied automatically
3. **Slippage**: Real trades may fill at slightly different prices
4. **Margin Changes**: Margin requirements can change
5. **Sync Issues**: Database might be out of sync with exchange
6. **Complex Logic**: Requires maintaining complex calculation code

## Implementation

### Paper Trading (Current System)

```typescript
// ❌ Paper Trading: Calculate balance manually
async function calculateAgentBalance(agent, marketData) {
  const INITIAL_BALANCE = 1000;
  
  // Get realized PnL from closed trades
  const realizedPnL = await getRealizedPnL(agent._id);
  
  // Calculate unrealized PnL from open positions
  const unrealizedPnL = calculateUnrealizedPnL(agent.activePositions, marketData);
  
  // Calculate total balance
  return INITIAL_BALANCE + realizedPnL + unrealizedPnL;
}

// Update agent balance
agent.balance = await calculateAgentBalance(agent, marketData);
```

### Real Trading (Aster API)

```typescript
// ✅ Real Trading: Fetch balance from Aster API
import { getAsterAccountBalance, syncBalanceFromAster } from './lib/aster-real-trading';

async function updateAgentBalance(agent, walletConfig) {
  // Fetch real balance from Aster exchange
  const realBalance = await getAsterAccountBalance(walletConfig);
  
  // Update agent with real balance
  agent.balance = realBalance;
  agent.pnlAbsolute = realBalance - INITIAL_BALANCE;
  agent.pnl = (agent.pnlAbsolute / INITIAL_BALANCE) * 100;
  
  await agent.save();
}

// Or use the helper function:
await syncBalanceFromAster(agent, walletConfig, INITIAL_BALANCE);
```

## API Endpoints

### GET /fapi/v3/balance

**Simpler endpoint** - Returns just balance information:

```typescript
const balance = await getAsterAccountBalance(walletConfig);
// Returns: 1023.45 (number)
```

**Response structure:**
```json
[
  {
    "asset": "USDT",
    "balance": "1023.45",           // Total wallet balance (includes unrealized PnL)
    "crossWalletBalance": "1023.45", // Cross wallet balance
    "availableBalance": "923.45",    // Available for new trades
    "maxWithdrawAmount": "923.45"    // Max withdrawal
  }
]
```

### GET /fapi/v3/account

**Full account info** - Returns balance + positions + margin:

```typescript
const accountInfo = await getAsterAccountInfo(walletConfig);
// Returns full account information including:
// - totalWalletBalance
// - totalUnrealizedProfit
// - totalMarginBalance
// - positions array
// - assets array
```

**Use this when you need:**
- Detailed margin information
- Position details
- Multiple assets
- Full account state

## Integration Example

### In Trading Worker

```typescript
// backend/trading-worker.js

const { 
  getAgentWalletConfig,
  syncBalanceFromAster,
  executeRealTrade 
} = require('./lib/aster-real-trading');

async function processAgent(agent) {
  const walletConfig = getAgentWalletConfig(agent);
  
  if (walletConfig) {
    // REAL TRADING MODE
    
    // 1. Execute trade (if decision made)
    if (shouldTrade) {
      await executeRealTrade(decision, price, walletConfig);
    }
    
    // 2. Sync balance from Aster API (IMPORTANT!)
    await syncBalanceFromAster(agent, walletConfig, INITIAL_BALANCE);
    
    // 3. Sync positions from Aster
    const positions = await getAsterPositions(walletConfig);
    agent.activePositions = mapAsterPositionsToLocal(positions);
    
  } else {
    // PAPER TRADING MODE
    // Calculate balance manually (existing code)
    const balance = await calculateAgentBalance(agent, marketData);
    agent.balance = balance;
  }
  
  await agent.save();
}
```

### Periodic Balance Updates

```typescript
// Update all agent balances every 30 seconds
setInterval(async () => {
  for (const agent of agents) {
    const walletConfig = getAgentWalletConfig(agent);
    
    if (walletConfig) {
      // Real trading: Fetch from API
      await syncBalanceFromAster(agent, walletConfig, INITIAL_BALANCE);
    } else {
      // Paper trading: Calculate
      const balance = await calculateAgentBalance(agent, marketData);
      agent.balance = balance;
      await agent.save();
    }
  }
}, 30000); // Every 30 seconds
```

## Key Differences Summary

| Aspect | Paper Trading | Real Trading |
|--------|---------------|--------------|
| **Balance Source** | Calculated from DB | Fetched from Aster API |
| **Includes Fees** | ❌ Manual calculation | ✅ Automatic |
| **Includes Funding** | ❌ Must calculate | ✅ Automatic |
| **Unrealized PnL** | ✅ Calculated | ✅ Included in API response |
| **Real-time Accuracy** | ⚠️ May be out of sync | ✅ Always accurate |
| **Complexity** | High (maintain calc logic) | Low (one API call) |

## When to Fetch vs Calculate

### ✅ Always Fetch from API When:
- Doing real trading
- Need accurate balance for trading decisions
- Displaying balance to users
- Checking if agent has enough funds
- Updating balance in database

### ⚠️ Can Calculate When:
- Paper trading only
- For quick estimates
- When API is unavailable (fallback)

## Error Handling

```typescript
async function updateBalanceSafely(agent, walletConfig) {
  try {
    // Try to fetch from API first
    await syncBalanceFromAster(agent, walletConfig, INITIAL_BALANCE);
  } catch (error) {
    console.error('Failed to fetch balance from Aster:', error);
    
    // Fallback: Use last known balance or calculate
    // (Don't update if API fails - keep last known good balance)
    console.warn(`Using last known balance: $${agent.balance}`);
  }
}
```

## Performance Considerations

### Caching

You can cache the balance to reduce API calls:

```typescript
let cachedBalance = null;
let cacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

async function getCachedBalance(walletConfig) {
  const now = Date.now();
  
  if (cachedBalance && (now - cacheTime) < CACHE_TTL) {
    return cachedBalance; // Return cached value
  }
  
  // Fetch fresh balance
  cachedBalance = await getAsterAccountBalance(walletConfig);
  cacheTime = now;
  
  return cachedBalance;
}
```

### Rate Limits

Aster API rate limits:
- Balance endpoint: Weight 5 per request
- Account endpoint: Weight 5 per request
- Limit: 2400 weight per minute

For 8 agents updating every 30 seconds:
- 8 agents × 2 requests/minute = 16 requests
- 16 × 5 weight = 80 weight/minute ✅ Well under limit

## Summary

**With real trading, always fetch balance from Aster API using `getAsterAccountBalance()` or `syncBalanceFromAster()`. Don't calculate it manually.**

The API gives you:
- ✅ Accurate balance
- ✅ All fees included
- ✅ Unrealized PnL included
- ✅ Single source of truth
- ✅ Simple implementation

