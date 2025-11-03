# Multi-Agent Setup Guide

## Understanding Aster's Architecture

**How Aster Works:**
- **Main Account (user)**: Your primary trading wallet address (`0xbada17e8f51b3af018f69f627887d6b4e1da0d18`)
- **API Wallet (signer)**: A separate wallet you create for API access
- **Key Point**: One main account can have **multiple API wallets**
- Each API wallet acts as a separate "agent" with its own identity

## Steps to Run Multiple Agents

### Step 1: Create Multiple API Wallets on Aster

You need to create additional API wallets. Each one becomes an agent.

**Method 1: Via Aster Website**
1. Login to Aster Dex
2. Go to Settings → API Management → Pro API
3. Create a new API wallet for each agent
4. Save each wallet's:
   - Address (signer)
   - Private key
   - Name/description

**Method 2: Programmatically** (see `demo/create-apikey-front.js`)

### Step 2: Create Agent Configurations

Create config files for each agent:

```javascript
// backend/config/agents.js
module.exports = [
  {
    id: 'agent-1',
    name: 'Conservative Agent',
    futuresV3: {
      user: '0xbada17e8f51b3af018f69f627887d6b4e1da0d18', // Your main account
      signer: '0x6419b6194E1Dab06BEBf7A20a8A855E42a59c174', // API wallet 1
      signerPrivateKey: process.env.AGENT_1_PRIVATE_KEY || 'YOUR_FIRST_API_WALLET_PRIVATE_KEY',
      baseURL: 'https://fapi.asterdex.com'
    },
    trading: {
      maxPositions: 3,
      minConfidence: 0.70,
      positionSizePercent: 0.08,
      strategy: 'conservative'
    }
  },
  {
    id: 'agent-2',
    name: 'Aggressive Agent',
    futuresV3: {
      user: '0xbada17e8f51b3af018f69f627887d6b4e1da0d18', // Same main account
      signer: '0xYOUR_SECOND_API_WALLET_ADDRESS', // Different API wallet
      signerPrivateKey: '0xYOUR_SECOND_PRIVATE_KEY',
      baseURL: 'https://fapi.asterdex.com'
    },
    trading: {
      maxPositions: 5,
      minConfidence: 0.60,
      positionSizePercent: 0.12,
      strategy: 'aggressive'
    }
  }
];
```

### Step 3: Modify Code to Support Config Injection

The trading modules need to accept agent-specific configs.

### Step 4: Create Multi-Agent Manager

A manager that runs multiple agents simultaneously.

### Step 5: Run Multiple Agents

**Option A: Single Process**
```bash
node backend/multi-agent-manager.js
```

**Option B: Separate Processes** (Recommended)
```bash
# Terminal 1
AGENT_ID=agent-1 node backend/index.js

# Terminal 2  
AGENT_ID=agent-2 node backend/index.js
```

**Option C: PM2** (Production)
```bash
pm2 start ecosystem.config.js
```

## Key Considerations

1. **Same Account, Different Strategies**
   - All agents share the same main account balance
   - Each agent has its own API wallet identity
   - Different trading strategies per agent

2. **Position Limits**
   - Total positions = sum of all agent positions
   - Consider global position limits
   - Agents might trade same symbols

3. **Rate Limits**
   - Each API wallet has its own rate limits
   - More agents = more API calls
   - Monitor per-agent limits

4. **Balance Sharing**
   - If using same account, balance is shared
   - Each agent needs to respect total balance
   - Implement position size limits per agent

5. **Logging**
   - Separate logs per agent
   - Track performance per agent
   - Agent name in all logs

## Architecture Options

### Option 1: Same Account, Different Strategies ✅ Recommended
- Same main account (`user`)
- Different API wallets (`signer`)
- Different trading configs
- **Use case**: Diversify strategies on same balance

### Option 2: Different Accounts
- Different main accounts
- Different API wallets
- Complete isolation
- **Use case**: Separate accounts for different purposes

### Option 3: Shared Balance, Isolated Trading
- Same account, multiple API wallets
- Each agent manages own positions
- Positions tracked separately
- **Use case**: Multiple strategies on same balance

## Next Steps

1. ✅ Understand Aster's API wallet system
2. ⏭️ Create multiple API wallets on Aster
3. ⏭️ Modify code to support config injection
4. ⏭️ Create agent configuration files
5. ⏭️ Implement multi-agent manager
6. ⏭️ Test with one agent first
7. ⏭️ Scale to multiple agents

## Questions to Answer

1. **Same account or different accounts?**
   - Same account = shared balance, easier management
   - Different accounts = complete isolation

2. **How many agents?**
   - More agents = more complexity
   - Start with 2-3 agents

3. **Different strategies?**
   - Conservative vs aggressive
   - Different symbols
   - Different timeframes

4. **Resource management?**
   - Each agent needs resources
   - Consider server capacity
   - Monitor API rate limits

Would you like me to implement the multi-agent system?
