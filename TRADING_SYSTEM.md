# 🤖 Aster Royale Trading System

## Overview

The trading system runs **every 30 seconds** to process all active AI agents.

### What Happens Every 30 Seconds:

1. **Market Data Fetch** — Gets current prices for all trading pairs (BTC, ETH, SOL, etc.)
2. **Agent Decision** — Each agent analyzes market data using their prompt/strategy
3. **Position Management** — Checks existing positions for exit conditions (stop loss, take profit)
4. **New Trades** — Opens new positions based on agent's trading signals
5. **Balance Updates** — Updates agent balance based on closed positions
6. **Stats Tracking** — Updates PnL, win rate, volume, etc.

## 🏗️ Architecture

### Database Models

#### Agent (`models/Agent.ts`)
- Stores agent data with balance, active positions, stats
- Fields: `balance`, `activePositions`, `pnl`, `winRate`, etc.

#### Position (`models/Position.ts`)
- Tracks all trading positions (open and closed)
- Records entry/exit, PnL, leverage, duration

### API Routes

#### `GET /api/process-agents`
- Main trading engine endpoint
- Call this every 30 seconds
- Processes all active agents
- Returns results summary

### Trading Engine (`lib/trading-engine.ts`)

#### `generateAgentDecision(agent, marketData)`
- Simulates agent's AI decision-making
- Returns trading signals (LONG, SHORT, CLOSE, HOLD, WAIT)
- Based on agent's strategy and current market conditions

#### `executeTrade(agent, decision, price)`
- Executes paper trades
- Opens/closes positions
- Updates agent balance

## 🚀 How to Run

### Option 1: Manual Testing

Visit: http://localhost:3003/api/process-agents

This will process all agents once. Call it every 30s manually or use a cron.

### Option 2: Bash Script (Recommended)

```bash
# Run the trading cron in background
./scripts/start-trading.sh &
```

### Option 3: External Cron Service

Set up an external cron service (Vercel Cron, etc.) to call:
```
GET https://your-domain.com/api/process-agents
```
Every 30 seconds.

### Option 4: Next.js Internal Scheduler

Add to your app (future enhancement):
```typescript
// In a server component or API route
setInterval(async () => {
  await fetch('/api/process-agents');
}, 30000);
```

## 📊 How Trading Works

### 1. Agent Initialization

Agents start with:
- **Balance**: $10,000 (paper trading)
- **Status**: active
- **Strategy**: Based on their prompt (momentum, mean reversion, etc.)

### 2. Decision Making (Every 30s)

Each agent:
1. **Analyzes market data** — Current prices, volatility
2. **Checks existing positions** — Do any need to close?
3. **Evaluates new setups** — Should I enter a new trade?
4. **Generates signals** — LONG, SHORT, CLOSE, HOLD, or WAIT

### 3. Trade Execution

When an agent decides to trade:
- **Opens position** at current market price
- **Sets stop loss** based on volatility
- **Sets take profit** with R:R ≥ 1.5
- **Calculates size** based on risk% and leverage
- **Tracks duration** (15min, 30min, 60min, etc.)

### 4. Position Management

Positions close when:
- **Stop Loss hit** — Automatically closed at loss
- **Take Profit hit** — Automatically closed at profit
- **Manual CLOSE signal** — Agent decides to exit

### 5. Balance Updates

After position closes:
- **Calculate PnL** based on entry/exit price
- **Update balance** → `balance += pnlAbsolute`
- **Update stats** → PnL%, win rate, volume
- **Record trade** in database

## 💡 Agent Strategy Examples

Each agent has a different trading approach:

- **NeuralSniper** (Momentum) — Quick scalps, high leverage
- **QuantumVortex** (Mean Reversion) — Counter-trend plays
- **DataSage** (Arbitrage) — Low-frequency, high-conviction
- **NovaHawk** (Trend Following) — Ride strong trends
- etc.

## 📝 Notes

### Current Implementation

- **Market Data**: Simulated (not real API)
- **Trading**: Paper trading only
- **Agents**: 8 pre-configured agents
- **Scheduling**: Manual or external cron

### Future Enhancements

1. **Real Aster API** — Connect to actual price feed
2. **AI Integration** — Use real LLM APIs for decisions
3. **Agent Prompts** — Support full prompt customization
4. **Real Trading** — Enable actual Aster DEX execution
5. **More Coins** — Add more trading pairs
6. **Advanced Strategies** — More sophisticated decision logic

## 🐛 Troubleshooting

**Agents not trading?**
- Check agent status is "active"
- Verify balance > 0
- Check market data is available

**No positions opening?**
- Check agent's exposure % (max 70%)
- Verify confidence threshold (needs > 0.6)
- Check if agent already has max positions

**Positions not closing?**
- Verify stop loss/take profit levels
- Check current market price movement
- Ensure API is being called every 30s

## 📚 API Examples

### Process Agents
```bash
curl http://localhost:3003/api/process-agents
```

### Fetch Agents
```bash
curl http://localhost:3003/api/agents
```

### Fetch Trades
```bash
curl http://localhost:3003/api/trades?agentId=agent-0&limit=10
```

