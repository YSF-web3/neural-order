# 🚀 Backend Setup Guide

## ✅ What's Been Implemented

The backend is now fully set up with MongoDB integration:

### Database
- **MongoDB Atlas** connection configured
- **Agent Model** — Stores AI trading agent data
- **Trade Model** — Stores simulated trade history

### API Routes

#### `/api/agents` (GET)
- Fetches all agents from MongoDB
- Returns sorted by PnL

#### `/api/agents` (POST)
- Initializes 8 AI agents in the database
- Only runs if no agents exist

#### `/api/agents` (PUT)
- Simulates trading activity for random agents
- Executes trades with real price simulation
- Updates agent stats in real-time
- Returns updated agents and new trades

#### `/api/trades` (GET)
- Fetches recent trades
- Optional: filter by `agentId`
- Optional: limit results

### Frontend Integration
- All frontend components now fetch from the API
- Real-time updates every 3 seconds
- Persistent data in MongoDB

## 🚀 First-Time Setup

### 1. Initialize Agents

**Option A: Via Browser**

Open http://localhost:3003/api/agents in your browser and send a POST request, or use:

```bash
curl -X POST http://localhost:3003/api/agents
```

**Option B: Create an Init Page**

I can create a one-time initialization page if you prefer.

### 2. Test the API

```bash
# Fetch agents
curl http://localhost:3003/api/agents

# Simulate trading activity
curl -X PUT http://localhost:3003/api/agents

# Fetch recent trades
curl http://localhost:3003/api/trades
```

### 3. Monitor Real-Time Updates

The frontend automatically:
- Fetches agents on page load
- Simulates trades every 3 seconds
- Updates the leaderboard in real-time
- Saves all data to MongoDB

## 📊 What's Happening

1. **Agents initialize** with random starting stats
2. **Trades are simulated** based on real price movements
3. **Stats update** (PnL, win rate, volume) after each trade
4. **Data persists** to MongoDB
5. **Frontend refreshes** every 3 seconds with new data

## 🔧 Configuration

### Environment Variables (`.env.local`)

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/asterroyale?retryWrites=true&w=majority&appName=Cluster0
```

### Price Simulation

Currently using mock price data in `lib/aster-prices.ts`.

**To integrate real Aster prices:**

1. Replace `getCurrentPrice()` with actual Aster API call
2. Use the API documentation in `/docs/`
3. Update `simulateTradeExecution()` to use real market data

## 🎯 Next Steps

1. **Initialize agents** — POST to `/api/agents`
2. **Monitor the dashboard** — Agents will start trading automatically
3. **Check individual agents** — Click on any agent card
4. **View trade history** — All trades are saved to MongoDB

## 🐛 Troubleshooting

**Agents not showing?**
- Make sure agents are initialized (POST to `/api/agents`)
- Check MongoDB connection in `.env.local`

**Trades not updating?**
- Check browser console for errors
- Verify API routes are responding
- Check MongoDB is connected

**Error: "Agents already initialized"?**
- This is normal — agents only initialize once
- The database already has agents

