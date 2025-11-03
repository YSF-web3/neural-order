# 🔧 Aster Royale - Backend Trading Worker

## Overview

**This is a standalone Node.js backend** that runs the AI trading engine independently from the Next.js frontend.

### What It Does

- Runs continuously in the background
- Processes all AI agents **every 30 seconds**
- Uses OpenAI to generate trading decisions for each agent
- Executes paper trades and updates balances
- Saves all data to MongoDB

### Why Separate?

- **Background Service**: Runs independently from web server
- **No HTTP Request Overhead**: Direct database access
- **Reliable**: Can run on different server/container
- **Scalable**: Can run multiple workers

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create/update `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/asterroyale?retryWrites=true&w=majority&appName=Cluster0
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Start the Backend

```bash
# Run once
node backend/trading-worker.js

# Or run with auto-restart (development)
npx nodemon backend/trading-worker.js
```

## 📊 How It Works

### Processing Cycle (Every 30s)

1. **Fetch Market Data** — Gets current prices for all coins
2. **For Each Agent**:
   - Send market data + agent prompt to OpenAI
   - Receive trading decision (LONG, SHORT, CLOSE, HOLD, WAIT)
   - Execute decision:
     - **CLOSE**: Calculate PnL, update balance, close position
     - **LONG/SHORT**: Open new position, update stats
     - **HOLD**: Keep existing position
     - **WAIT**: No action
3. **Update Database** — Save all changes to MongoDB
4. **Repeat** — Wait 30 seconds, repeat cycle

### Console Output

```
🚀 Aster Royale Trading Worker
================================
MongoDB: connected
OpenAI: configured
Processing agents every 30 seconds...

[2024-01-20T10:00:00.000Z] Processing agents...
  Found 8 active agents

  Processing NeuralSniper...
    BTC: LONG
      ✓ Opened LONG at 45123.45
      Size: $1000.00 | Leverage: 10x
      Balance: $10000.00 | PnL: 0.00%

  Processing QuantumVortex...
    ETH: SHORT
      ✓ Opened SHORT at 2448.32
      Size: $1200.00 | Leverage: 12x
      Balance: $10000.00 | PnL: 0.00%

✓ Processed all agents
```

## 🎯 Features

### ✅ What's Included

- **AI-Powered Decisions** — Each agent uses OpenAI with their custom prompt
- **Market Data Simulation** — Realistic price fluctuations
- **Position Management** — Opens and closes positions automatically
- **Balance Tracking** — Paper trading balance updates in real-time
- **Risk Management** — Leverage, stop loss, take profit
- **Database Integration** — All trades saved to MongoDB
- **Status Monitoring** — Agent status (active/slow/error) based on performance

### 🔄 Agent States

- **active**: Balance > $8,000 (trading normally)
- **slow**: Balance < $8,000 (risk reduced)
- **error**: Balance < $5,000 (major drawdown)

## 🏃 Running

### Development

```bash
# Terminal 1: Start Next.js frontend
npm run dev

# Terminal 2: Start backend worker
node backend/trading-worker.js
```

### Production

```bash
# Start backend as background process
node backend/trading-worker.js &

# Or use PM2
pm2 start backend/trading-worker.js --name "aster-trading"

# View logs
pm2 logs aster-trading
```

## 📊 Monitoring

### Check Agent Status

Visit: http://localhost:3003

### Check MongoDB

```bash
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/asterroyale"

# Query agents
db.agents.find()

# Query positions
db.positions.find().sort({ createdAt: -1 }).limit(10)
```

## 🛠️ Configuration

### Adjust Processing Frequency

Edit `backend/trading-worker.js`:

```javascript
// Change from 30000 (30s) to your preferred interval
setInterval(async () => {
  await processAgents();
}, 30000); // milliseconds
```

### Update Agent Prompts

Agents are initialized in Next.js API. Their prompts are stored in MongoDB.

To update an agent's prompt:
1. Open MongoDB
2. Find the agent document
3. Update the `prompt` field
4. Restart the worker

## 🐛 Troubleshooting

**Worker not processing?**
- Check MongoDB connection
- Verify OPENAI_API_KEY is set
- Check console for errors

**No trades being executed?**
- Verify agents exist in database
- Check agent status is "active"
- Ensure balance > 0

**OpenAI errors?**
- Verify API key is valid
- Check API rate limits
- Monitor costs

## 📝 Notes

### Current Implementation

- **Market Data**: Simulated prices (not real API)
- **Trading**: Paper trading only (no real DEX orders)
- **AI Model**: GPT-4o-mini (cost-efficient)
- **Database**: MongoDB Atlas

### Future Enhancements

1. **Real Aster API** — Connect to actual price feed
2. **Real Trading** — Execute actual orders on Aster DEX
3. **Better Prompts** — More sophisticated trading strategies
4. **Risk Limits** — Daily loss limits, max exposure
5. **Monitoring** — Dashboard for worker status

## 🚀 Deployment

### Heroku

```bash
# Procfile
worker: node backend/trading-worker.js

# Deploy
git push heroku main
```

### Railway

```bash
# railway.json
{
  "deploy": {
    "start": "node backend/trading-worker.js"
  }
}
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "backend/trading-worker.js"]
```

---

**The backend worker is completely independent from the Next.js app!**

