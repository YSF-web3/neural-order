# API Key Strategy: One vs Many

## The Question

**Do you need one API key per agent, or is one enough?**

The answer depends on your goals:

## Option 1: One API Key (Shared Account) 

### How It Works

All agents use the **same wallet/account** to trade:

```typescript
// All agents share the same wallet config
const SHARED_WALLET_CONFIG = {
  user: "0x123...",    // One main wallet
  signer: "0x456...", // One API wallet
  privateKey: "0x789..." // One private key
};

// All agents trade from the same balance
for (const agent of agents) {
  await executeRealTrade(agent, decision, price, SHARED_WALLET_CONFIG);
}
```

### Pros ✅

- **Simple setup**: Only need to configure one wallet
- **Lower cost**: No need to fund multiple accounts
- **Easier management**: One set of credentials to secure
- **Unified balance**: All trades come from one account
- **Simpler risk management**: One account to monitor

### Cons ❌

- **No real competition**: Agents aren't actually competing since they share funds
- **Mixed positions**: All agents' positions are in one account (can't track individually on-chain)
- **Balance confusion**: If one agent loses money, all agents are affected
- **Can't isolate failures**: One agent's bad trade affects everyone
- **No independent performance**: Can't show "Agent X made $500, Agent Y lost $200" separately

### Use Case

✅ **Best for**: Internal testing, single-strategy execution, or when agents represent different strategies but share capital

## Option 2: One API Key Per Agent (Recommended)

### How It Works

Each agent has its **own wallet/account**:

```typescript
// Each agent has unique wallet config
const agentWalletConfigs = {
  "NeuralSniper": {
    user: "0x111...",    // Agent 1's wallet
    signer: "0x222...",
    privateKey: process.env.NEURALSNIPER_PRIVATE_KEY
  },
  "QuantumVortex": {
    user: "0x333...",    // Agent 2's wallet
    signer: "0x444...",
    privateKey: process.env.QUANTUMVORTEX_PRIVATE_KEY
  },
  // ... one per agent
};

// Each agent trades from their own balance
for (const agent of agents) {
  const walletConfig = agentWalletConfigs[agent.name];
  await executeRealTrade(agent, decision, price, walletConfig);
}
```

### Pros ✅

- **Real competition**: Agents truly compete with separate funds
- **Independent performance**: Each agent's PnL is tracked separately on-chain
- **Isolated risk**: One agent's failure doesn't affect others
- **Showcase value**: Demonstrates that each AI strategy works independently
- **Better for leaderboards**: Real separation of winners/losers
- **Matches paper trading**: Same independence as your current system

### Cons ❌

- **More setup**: Need to create/fund multiple wallets
- **More management**: Multiple credentials to secure
- **Higher cost**: Need funds in each account
- **More complexity**: Managing multiple API keys

### Use Case

✅ **Best for**: Aster Royale (competition showcase), true performance comparison, public demonstrations

## Recommendation for Aster Royale

**Use Option 2: One API key per agent**

### Why?

1. **Matches your concept**: "AI Arena" implies competition between agents
2. **Better showcase**: Visitors can see real independent performance
3. **Leaderboard credibility**: Real separation makes rankings meaningful
4. **Matches paper trading**: Your current system already treats agents independently

## Implementation

### Minimal Setup (Start Small)

You can start with **2-3 agents** using real trading, keep the rest in paper mode:

```typescript
// models/Agent.ts
export interface IAgent extends Document {
  // ... existing fields ...
  
  // Wallet config (only set for agents doing real trading)
  asterUserAddress?: string;
  asterSignerAddress?: string;
  isPaperTrading: boolean; // true = paper, false = real
}

// Example: Only top 2 agents trade with real money
const REAL_TRADING_AGENTS = ["NeuralSniper", "QuantumVortex"];
```

### Environment Variables

```bash
# Option 1: Individual keys per agent
AGENT_NEURALSNIPER_USER=0x111...
AGENT_NEURALSNIPER_SIGNER=0x222...
AGENT_NEURALSNIPER_PRIVATE_KEY=0x333...

AGENT_QUANTUMVORTEX_USER=0x444...
AGENT_QUANTUMVORTEX_SIGNER=0x555...
AGENT_QUANTUMVORTEX_PRIVATE_KEY=0x666...

# Option 2: Shared config (if going with one key)
SHARED_ASTER_USER=0x111...
SHARED_ASTER_SIGNER=0x222...
SHARED_ASTER_PRIVATE_KEY=0x333...
```

### Code Implementation

```typescript
// lib/get-agent-wallet-config.ts
export function getAgentWalletConfig(agent: IAgent): AgentWalletConfig | null {
  // If agent is in paper trading mode, return null
  if (agent.isPaperTrading !== false) {
    return null;
  }
  
  // Get agent-specific config
  const user = process.env[`AGENT_${agent.name.toUpperCase()}_USER`];
  const signer = process.env[`AGENT_${agent.name.toUpperCase()}_SIGNER`];
  const privateKey = process.env[`AGENT_${agent.name.toUpperCase()}_PRIVATE_KEY`];
  
  // Or use shared config if individual not set
  if (!user || !signer || !privateKey) {
    return {
      user: process.env.SHARED_ASTER_USER!,
      signer: process.env.SHARED_ASTER_SIGNER!,
      privateKey: process.env.SHARED_ASTER_PRIVATE_KEY!,
    };
  }
  
  return { user, signer, privateKey };
}

// In trading worker
async function processAgent(agent: IAgent) {
  const decision = await generateAgentDecision(agent, marketData);
  const walletConfig = getAgentWalletConfig(agent);
  
  if (walletConfig) {
    // Real trading
    await executeRealTrade(agent, decision, marketPrice, walletConfig);
  } else {
    // Paper trading (existing code)
    executeTrade(agent, decision, marketPrice);
  }
}
```

## Hybrid Approach (Best of Both Worlds)

You can **mix both strategies**:

- **Top 3 agents**: Real trading with individual wallets (true competition)
- **Remaining agents**: Paper trading (no cost, still visible on leaderboard)
- **Or**: All agents use real trading, but share one wallet (simpler)

```typescript
const REAL_TRADING_AGENTS = ["NeuralSniper", "QuantumVortex", "DataSage"];
const agentMode = REAL_TRADING_AGENTS.includes(agent.name) 
  ? "real" 
  : "paper";
```

## Cost Consideration

### One Shared Wallet
- **Initial funding**: $10,000 total (shared by all agents)
- **Maintenance**: One account to monitor

### Individual Wallets (8 agents)
- **Initial funding**: $10,000 × 8 = $80,000 total
- **OR**: Smaller amounts per agent ($1,000 each = $8,000)
- **Maintenance**: 8 accounts to monitor

### Recommendation

Start with **individual wallets but smaller amounts**:
- $500-$1,000 per agent (enough to demonstrate)
- Total: $4,000-$8,000 for 8 agents
- Still shows real competition, but manageable cost

## Security Considerations

### One API Key
- ✅ Only one private key to secure
- ❌ If compromised, all agents affected

### Multiple API Keys
- ❌ More private keys to secure
- ✅ If one compromised, others safe
- ✅ Better isolation and security

## Summary

| Aspect | One Key | Multiple Keys |
|--------|---------|---------------|
| **Setup Complexity** | Simple | More complex |
| **Cost** | Lower | Higher |
| **Competition** | Fake (shared funds) | Real (independent) |
| **Showcase Value** | Lower | Higher |
| **Risk Isolation** | Poor | Good |
| **Matches Paper Trading** | No | Yes |

**For Aster Royale**: Use **multiple keys** (one per agent) for true competition and showcase value.

