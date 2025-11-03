# Aster Account Structure: API Wallets vs Balances

## Answer: No, API wallets do NOT have separate balances

**Key Point:** API wallets (`signer`) are **authentication mechanisms only**, not separate accounts with their own balances.

## How It Works

### Main Account (user)
- **Has the balance**: All funds are stored in your main account wallet address
- **One main account** = One balance
- Example: `0xbada17e8f51b3af018f69f627887d6b4e1da0d18`

### API Wallets (signer)
- **Used for authentication only**: They sign requests to prove you own the API wallet
- **Multiple API wallets** can be created for the same main account
- **Do NOT have separate balances**: They all access the same main account balance
- Example: `0x6419b6194E1Dab06BEBf7A20a8A855E42a59c174` (API wallet 1)

## What This Means for Multiple Agents

### ✅ Same Balance, Different Identities
- **All agents share the same balance** (from main account)
- **Each agent has a different API wallet** (different `signer`)
- **Each agent can trade independently** but uses the same pool of funds

### Example Scenario:

```
Main Account: 0xbada17e8f51b3af018f69f627887d6b4e1da0d18
Balance: $1000 USDT

Agent 1:
- API Wallet: 0x6419b6194E1Dab06BEBf7A20a8A855E42a59c174
- Access: Same $1000 USDT balance

Agent 2:
- API Wallet: 0xANOTHER_API_WALLET_ADDRESS  
- Access: Same $1000 USDT balance

Agent 3:
- API Wallet: 0xYET_ANOTHER_API_WALLET_ADDRESS
- Access: Same $1000 USDT balance
```

## Important Implications

### 1. Shared Balance
- All agents compete for the same balance
- If Agent 1 uses $100, Agent 2 sees $900 remaining
- Need to coordinate position sizes across agents

### 2. Position Limits
- Total positions = sum of all agent positions
- If Agent 1 has 3 positions, Agent 2 can only open 2 more (if max is 5)
- Need global position tracking

### 3. No Isolation
- Cannot separate funds between agents
- All agents trade from the same account
- Risk is shared across all agents

### 4. Rate Limits
- Each API wallet has its own rate limits
- Multiple agents = more API calls = faster rate limit consumption
- But each agent's limit is separate

## API Response Structure

When you call `/fapi/v3/balance`, you get:

```json
{
  "accountAlias": "sRfWuXuXsRuXTi",  // Main account identifier
  "asset": "USDT",
  "balance": "1000.00",              // Balance of main account
  "availableBalance": "950.00"      // Available for trading
}
```

**Note:** The `accountAlias` is tied to your main account (`user`), not the API wallet (`signer`).

## For Multi-Agent Setup

### Strategy Options:

**Option 1: Coordinate Balance Usage** ✅ Recommended
- All agents share balance
- Each agent uses a percentage (e.g., Agent 1: 30%, Agent 2: 30%, Agent 3: 40%)
- Implement global balance tracking
- Prevent over-allocation

**Option 2: Separate Main Accounts**
- Create separate main accounts
- Each account has its own balance
- Complete isolation
- More complex setup

**Option 3: Allocate Balance Manually**
- Manually fund different strategies
- Use different main accounts for each strategy
- Complete control and isolation

## Conclusion

**API wallets are authentication keys, not separate accounts.**

- ✅ Multiple API wallets = Multiple authentication methods
- ❌ Multiple API wallets ≠ Multiple balances
- ✅ All API wallets access the same main account balance
- ✅ Each API wallet can trade independently
- ⚠️ Need to coordinate balance usage across agents

This means for multiple agents, you'll need to:
1. Track total balance across all agents
2. Implement position limits per agent
3. Coordinate position sizing
4. Monitor total exposure

Would you like me to implement balance coordination for multiple agents?

