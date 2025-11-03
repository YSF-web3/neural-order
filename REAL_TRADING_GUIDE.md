# Real Trading with Aster API - Implementation Guide

## Overview

This guide explains how to convert your **paper trading system** to **real trading** using the Aster Futures API v3.

## Key Differences: Paper Trading vs Real Trading

### Paper Trading (Current System)

✅ **What it does:**
- Simulates trades in database only
- Tracks positions in MongoDB
- Uses mock balance calculations
- No actual funds at risk

✅ **How it works:**
```typescript
// lib/trading-engine.ts
export function executeTrade(agent, decision, marketPrice) {
  // Just creates a position object in memory/DB
  const newPosition = {
    coin: decision.trade_signal_args.coin,
    entry_price: marketPrice,
    // ... more fields
  };
  return { success: true, newPosition };
}
```

### Real Trading (Aster API)

⚠️ **What it does:**
- Executes actual orders on Aster exchange
- Uses real wallet funds
- Creates positions on Aster's order book
- Funds are at risk

⚠️ **How it works:**
```typescript
// lib/aster-real-trading.ts
export async function placeAsterOrder(orderParams, walletConfig) {
  // 1. Sign the order with Web3 signature
  const signature = await generateAsterSignature(...);
  
  // 2. Send order to Aster API
  const response = await fetch('https://fapi.asterdex.com/fapi/v3/order', {
    method: 'POST',
    body: orderParams + signature
  });
  
  // 3. Order is placed on exchange
  return orderResponse;
}
```

## Architecture Changes

### Current Flow (Paper Trading)

```
AI Agent Decision → executeTrade() → MongoDB Position → Balance Update (calculated)
```

### New Flow (Real Trading)

```
AI Agent Decision → executeRealTrade() → Aster API → Real Order Placed → 
Aster Position Created → Sync Position to MongoDB → Real Balance from Aster
```

## Required Setup

### 1. Agent Wallet Configuration

Each agent needs **two wallet addresses**:

1. **User Address** (`user`): Main wallet where funds are held
2. **Signer Address** (`signer`): API wallet used for signing orders
3. **Private Key**: Private key of the signer wallet (for signing)

**Security Note:** Never expose private keys in code or logs. Store them in:
- Environment variables (`.env.local`)
- Encrypted database fields
- Secure key management service (AWS Secrets Manager, etc.)

### 2. Update Agent Model

Add wallet fields to your Agent schema:

```typescript
// models/Agent.ts
export interface IAgent extends Document {
  // ... existing fields ...
  
  // Aster wallet configuration (for real trading)
  asterUserAddress?: string;     // Main wallet address
  asterSignerAddress?: string;   // API wallet address
  isPaperTrading?: boolean;      // Toggle: paper vs real
}
```

### 3. Environment Variables

Add to `.env.local`:

```bash
# Agent Private Keys (one per agent, or use a key management system)
AGENT_NEURALSNIPER_PRIVATE_KEY=0x...
AGENT_QUANTUMVORTEX_PRIVATE_KEY=0x...
# ... etc

# Or use a single shared API wallet for all agents
SHARED_ASTER_SIGNER_PRIVATE_KEY=0x...
```

## Integration Steps

### Step 1: Install Dependencies

```bash
npm install ethers eth-abi
```

### Step 2: Modify Trading Worker

Update `backend/trading-worker.js` to support both modes:

```javascript
const { executeRealTrade } = require('../lib/aster-real-trading');

async function processAgentTrade(agent, decision, marketPrice) {
  // Check if agent is in real trading mode
  if (agent.isPaperTrading === false && agent.asterSignerAddress) {
    // REAL TRADING MODE
    const walletConfig = {
      user: agent.asterUserAddress,
      signer: agent.asterSignerAddress,
      privateKey: process.env[`AGENT_${agent.name}_PRIVATE_KEY`] || 
                  process.env.SHARED_ASTER_SIGNER_PRIVATE_KEY,
    };
    
    const result = await executeRealTrade(decision, marketPrice, walletConfig);
    
    if (result.success) {
      // Order was placed on Aster
      // Sync position from Aster API to MongoDB
      await syncAsterPositionToDB(agent, result.orderResponse);
    } else {
      console.error(`Failed to place real order for ${agent.name}:`, result.error);
    }
  } else {
    // PAPER TRADING MODE (existing code)
    const result = executeTrade(agent, decision, marketPrice);
    // ... existing paper trading logic
  }
}
```

### Step 3: Sync Positions from Aster

Real positions exist on Aster, not just in your DB. You need to:

1. **Query Aster API** for current positions
2. **Sync them to MongoDB** for display
3. **Update balances** from Aster account balance

```typescript
// lib/aster-position-sync.ts
export async function syncAsterPositions(agent: IAgent) {
  const walletConfig = {
    user: agent.asterUserAddress!,
    signer: agent.asterSignerAddress!,
    privateKey: process.env[`AGENT_${agent.name}_PRIVATE_KEY`]!,
  };
  
  // Get positions from Aster
  const asterPositions = await getAsterPositions(walletConfig);
  
  // Convert to your Position model format
  // Update MongoDB
  // Update agent balance from Aster account
}
```

### Step 4: Update Balance Calculation

Instead of calculating balance from trades, fetch from Aster:

```typescript
// Get real balance from Aster account
export async function getAsterAccountBalance(
  walletConfig: AgentWalletConfig
): Promise<number> {
  // Call GET /fapi/v2/balance endpoint
  // Return actual USDT balance
}
```

## Order Types Available

### Market Orders
```typescript
await placeAsterOrder({
  symbol: "BTCUSDT",
  side: "BUY",
  type: "MARKET",
  quantity: "0.1",
}, walletConfig);
```

### Limit Orders
```typescript
await placeAsterOrder({
  symbol: "ETHUSDT",
  side: "BUY",
  type: "LIMIT",
  quantity: "1.0",
  price: "2450.00",
  timeInForce: "GTC",
}, walletConfig);
```

### Stop Loss Orders
```typescript
await placeAsterOrder({
  symbol: "BTCUSDT",
  side: "SELL",
  type: "STOP_MARKET",
  stopPrice: "45000",
  quantity: "0.1",
  reduceOnly: "true", // Closes position
}, walletConfig);
```

### Take Profit Orders
```typescript
await placeAsterOrder({
  symbol: "BTCUSDT",
  side: "SELL",
  type: "TAKE_PROFIT_MARKET",
  stopPrice: "50000",
  quantity: "0.1",
  reduceOnly: "true",
}, walletConfig);
```

## Risk Management

### ⚠️ Critical Considerations

1. **Start Small**: Test with minimal funds first
2. **Error Handling**: Network failures, API errors, rate limits
3. **Slippage**: Market orders may fill at different prices
4. **Leverage**: Set leverage before placing orders
5. **Position Limits**: Check exchange position limits
6. **Funds**: Ensure sufficient balance for margin

### Recommended Safeguards

```typescript
// 1. Validate order size
if (size_usd > agent.balance * 0.2) {
  throw new Error('Order size exceeds 20% of balance');
}

// 2. Check position limits
const existingPositions = await getAsterPositions(walletConfig);
if (existingPositions.length >= MAX_POSITIONS) {
  throw new Error('Maximum positions reached');
}

// 3. Handle API errors gracefully
try {
  const result = await executeRealTrade(...);
} catch (error) {
  // Log error, don't retry automatically
  // Notify admin
  // Fall back to paper trading if needed
}
```

## Testing Strategy

### Phase 1: Test Authentication
```typescript
// Test signature generation
const signature = await generateAsterSignature(params, walletConfig, nonce);
console.log('Signature:', signature);
```

### Phase 2: Test Order Placement (Small Size)
```typescript
// Place tiny test order
const result = await placeAsterOrder({
  symbol: "BTCUSDT",
  side: "BUY",
  type: "MARKET",
  quantity: "0.001", // Very small
}, walletConfig);
```

### Phase 3: Test Position Management
```typescript
// Open and close a test position
// Verify it appears in Aster account
```

### Phase 4: Integration Testing
```typescript
// Run trading worker with one agent
// Monitor orders in real-time
// Compare DB positions with Aster positions
```

## Monitoring & Logging

### What to Log

```typescript
// Log every real trade
console.log({
  agent: agent.name,
  symbol: orderParams.symbol,
  side: orderParams.side,
  quantity: orderParams.quantity,
  orderId: orderResponse.orderId,
  status: orderResponse.status,
  timestamp: Date.now(),
});

// Log errors
console.error({
  agent: agent.name,
  error: error.message,
  decision: decision,
  timestamp: Date.now(),
});
```

### Dashboard Metrics

- Real vs Paper balance comparison
- Order execution success rate
- Average slippage
- API error rate
- Position sync status

## Migration Checklist

- [ ] Set up agent wallets (user + signer addresses)
- [ ] Store private keys securely
- [ ] Update Agent model with wallet fields
- [ ] Install ethers and eth-abi packages
- [ ] Implement `executeRealTrade` function
- [ ] Add position sync from Aster API
- [ ] Update balance fetching from Aster
- [ ] Add error handling and retries
- [ ] Test with minimal funds
- [ ] Add monitoring and alerts
- [ ] Document wallet addresses per agent
- [ ] Set up backup/fallback to paper trading

## Example: Complete Real Trade Flow

```typescript
// 1. Agent makes decision
const decision = await generateAgentDecision(agent, marketData);

// 2. Check if real trading enabled
if (!agent.isPaperTrading && agent.asterSignerAddress) {
  // 3. Get wallet config
  const walletConfig = {
    user: agent.asterUserAddress,
    signer: agent.asterSignerAddress,
    privateKey: process.env[`AGENT_${agent.name}_PRIVATE_KEY`],
  };
  
  // 4. Execute real trade
  const result = await executeRealTrade(decision, marketPrice, walletConfig);
  
  if (result.success) {
    // 5. Sync position from Aster
    const asterPosition = await getAsterPositions(walletConfig);
    
    // 6. Update MongoDB
    await updateAgentPositionInDB(agent, asterPosition);
    
    // 7. Update balance from Aster account
    const realBalance = await getAsterAccountBalance(walletConfig);
    agent.balance = realBalance;
    await agent.save();
  }
}
```

## Support & Resources

- **Aster API Docs**: `/docs/aster-finance-futures-api-v3.md`
- **Aster API Base URL**: `https://fapi.asterdex.com`
- **Test Endpoint**: Use `/fapi/v3/order/test` for testing (doesn't place real orders)

## Important Notes

⚠️ **Real trading involves real money. Always:**
- Test thoroughly before enabling
- Start with small amounts
- Monitor closely
- Have error handling
- Keep backups of wallet addresses
- Never commit private keys to git
- Use environment variables or secure storage

