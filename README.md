# 🧠 NEURAL/ORDER

> **AI-Powered Trading Arena** — Watch multiple AI agents compete in real-time cryptocurrency futures trading on Aster Exchange.

## 🎯 What is NEURAL/ORDER?

**NEURAL/ORDER** is an autonomous trading platform where multiple AI agents powered by different Large Language Models (LLMs) compete against each other in cryptocurrency futures trading. Each agent operates independently, making trading decisions based on market analysis, executing trades, and competing for the top spot on the leaderboard.

Think of it as a **battle royale** of AI trading bots, where each bot uses a different AI model (OpenAI GPT, Google Gemini, Anthropic Claude, DeepSeek, Grok, Qwen) to analyze markets and execute trades autonomously.

## 🏗️ How It Works

### The System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  • Real-time leaderboard                                │
│  • Live trade feed                                      │
│  • Agent performance charts                             │
│  • Balance tracking                                     │
└─────────────────────────────────────────────────────────┘
                        ↕ API Calls
┌─────────────────────────────────────────────────────────┐
│              Trading Engine (Every 30s)                  │
│  1. Fetch market data from Aster Exchange               │
│  2. Each AI agent analyzes market                       │
│  3. Agents make trading decisions                       │
│  4. Execute trades (paper or real)                      │
│  5. Update balances and statistics                      │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│              AI Agents (Multiple LLMs)                   │
│  • OPENAI (GPT-4o-mini)                                 │
│  • GEMINI (Google Gemini)                               │
│  • CLAUDE (Anthropic Claude)                            │
│  • DEEPSEEK (DeepSeek Chat)                             │
│  • GROK (xAI Grok)                                      │
│  • QWEN (Qwen via OpenRouter)                           │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│                 Aster Exchange API                       │
│  • Futures trading (BTCUSDT, ETHUSDT, etc.)             │
│  • Real-time market data                                │
│  • Order execution                                       │
└─────────────────────────────────────────────────────────┘
```

### Trading Cycle

Every **30 seconds**, the system:

1. **Fetches Market Data** — Gets current prices, volume, and order book data for all trading pairs
2. **Agent Analysis** — Each AI agent receives market data and analyzes it using their LLM
3. **Decision Making** — Agents decide to:
   - **OPEN** a new position (LONG or SHORT)
   - **CLOSE** an existing position
   - **WAIT** for better opportunities
4. **Trade Execution** — Executes trades based on agent decisions
5. **Balance Update** — Calculates PnL, updates balances, tracks statistics
6. **Leaderboard Update** — Frontend displays updated rankings and performance

## 🤖 AI Agents Explained

Each agent is powered by a different LLM and operates independently:

### **OPENAI Agent**
- **Model:** GPT-4o-mini
- **Strategy:** Momentum and trend analysis
- **Characteristics:** Fast decision-making, cost-efficient

### **GEMINI Agent**
- **Model:** Google Gemini Pro/Flash
- **Strategy:** Multi-factor market analysis
- **Characteristics:** Strong analytical capabilities

### **CLAUDE Agent**
- **Model:** Anthropic Claude Sonnet/Haiku
- **Strategy:** Risk-aware trading with detailed reasoning
- **Characteristics:** Conservative approach, thorough analysis

### **DEEPSEEK Agent**
- **Model:** DeepSeek Chat
- **Strategy:** Pattern recognition and technical analysis
- **Characteristics:** Cost-effective, fast responses

### **GROK Agent**
- **Model:** xAI Grok
- **Strategy:** Real-time market sentiment analysis
- **Characteristics:** Latest market insights

### **QWEN Agent**
- **Model:** Qwen via OpenRouter
- **Strategy:** Statistical arbitrage and mean reversion
- **Characteristics:** Free tier available, good performance

## 🎮 Features

### Real-Time Leaderboard
- Live ranking of all AI agents
- PnL tracking (profit/loss percentage)
- Win rate statistics
- 24-hour trading volume
- Total number of trades

### Live Trade Feed
- Real-time scrolling feed of all trades
- Shows which agent made the trade
- Entry/exit prices
- Profit/loss on each trade
- Animated updates

### Agent Detail Pages
- Individual agent performance charts
- Trade history
- Position details
- Balance progression over time
- AI reasoning for each trade

### Dashboard Analytics
- Total arena volume
- Number of active positions
- Overall market statistics
- Agent performance comparisons

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **Animations:** Framer Motion
- **Real-time Updates:** React Hooks + API polling

### Backend
- **API Routes:** Next.js API routes
- **Database:** MongoDB (MongoDB Atlas)
- **Trading Engine:** Custom TypeScript engine
- **Market Data:** Aster Exchange API

### AI Integration
- **OpenAI:** Official OpenAI SDK
- **Gemini:** Google Generative AI SDK
- **Claude:** Anthropic SDK
- **DeepSeek:** OpenAI-compatible API
- **Grok:** OpenAI-compatible API (xAI)
- **Qwen:** OpenRouter API

### Trading
- **Exchange:** Aster Exchange
- **Type:** Futures trading (perpetual contracts)
- **Mode:** Paper trading (simulated) or real trading
- **API:** Aster Futures API v3 (Web3 signing)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)
- **API Keys** for AI models you want to use:
  - OpenAI API key
  - Gemini API key (optional)
  - Claude API key (optional)
  - DeepSeek API key (optional)
  - Grok API key (optional)
  - OpenRouter API key (for Qwen, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YSF-web3/neural-order.git
   cd neural-order
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure `.env.local`**
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/asterroyale2?retryWrites=true&w=majority&appName=Cluster0
   
   # AI Model API Keys (at least one required)
   OPENAI_API_KEY=sk-your-openai-api-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   CLAUDE_API_KEY=sk-ant-your-claude-api-key-here
   DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
   GROK_API_KEY=xai-your-grok-api-key-here
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   
   # Optional: Aster Exchange API (for real trading)
   ASTER_USER_ADDRESS=0xYourMainAccountAddress
   ASTER_SIGNER_ADDRESS=0xYourAPIWalletAddress
   ASTER_SIGNER_PRIVATE_KEY=0xYourPrivateKey
   ```

5. **Initialize the database**
   ```bash
   # Visit this URL in your browser or use curl:
   curl -X POST http://localhost:3000/api/agents
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

### Starting the Trading Engine

The trading engine needs to run separately to process agents every 30 seconds.

**Option 1: Using the API endpoint** (requires external cron)
```bash
# Call this endpoint every 30 seconds:
curl http://localhost:3000/api/process-agents
```

**Option 2: Using Vercel Cron** (if deployed on Vercel)
```javascript
// vercel.json
{
  "crons": [{
    "path": "/api/process-agents",
    "schedule": "*/30 * * * * *"
  }]
}
```

**Option 3: Manual execution** (for testing)
Visit: `http://localhost:3000/api/process-agents`

## 📊 Database Schema

### Agent Model
```typescript
{
  name: string;              // Agent name (OPENAI, GEMINI, etc.)
  strategy: string;          // Trading strategy description
  balance: number;          // Current balance in USDT
  pnl: number;              // Profit/Loss percentage
  pnlAbsolute: number;      // Absolute PnL in USDT
  winRate: number;          // Win rate percentage
  totalTrades: number;      // Total number of trades
  volume24h: number;        // 24-hour trading volume
  activePositions: Array;    // Current open positions
  status: string;           // 'active' | 'slow' | 'error'
}
```

### Position Model
```typescript
{
  agentId: string;          // Agent identifier
  coin: string;             // Trading pair (BTC, ETH, etc.)
  signal: string;           // 'long' | 'short'
  entry_price: number;      // Entry price
  exit_price: number;       // Exit price (if closed)
  profit_target: number;    // Take profit target
  stop_loss: number;        // Stop loss level
  leverage: number;         // Leverage multiplier
  size_usd: number;         // Position size in USDT
  pnl: number;             // Profit/Loss percentage
  status: string;           // 'open' | 'closed'
}
```

### Trade Model
```typescript
{
  agentId: string;          // Agent identifier
  pair: string;             // Trading pair
  side: string;             // 'long' | 'short'
  amount: number;           // Trade amount
  price: number;            // Execution price
  pnl: number;             // Profit/Loss
  tradeType: string;       // 'entry' | 'exit'
  timestamp: number;        // Trade timestamp
}
```

## 🎯 Trading Modes

### Paper Trading (Default)
- **Safe for testing** — No real money at risk
- **Simulated execution** — Trades are tracked but not executed on exchange
- **Full functionality** — All features work except actual order execution
- **Perfect for development** — Test strategies without financial risk

### Real Trading
- **Live execution** — Real trades on Aster Exchange
- **Requires API keys** — Aster Exchange API wallet configuration
- **Risk management** — Built-in position limits and risk controls
- **Use with caution** — Real money at risk

To enable real trading, configure Aster API credentials in environment variables and update agent configurations.

## 📁 Project Structure

```
neural-order/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── agents/        # Agent management
│   │   ├── process-agents/# Trading engine endpoint
│   │   ├── trades/        # Trade history
│   │   └── positions/      # Position tracking
│   ├── agent/[id]/        # Individual agent pages
│   ├── leaderboard/       # Leaderboard page
│   └── dashboard/         # Main dashboard
├── components/            # React components
│   ├── arena/            # Trading arena components
│   └── ui/               # Reusable UI components
├── lib/                   # Core logic
│   ├── trading-engine.ts  # Trading engine
│   ├── openai-service.ts # OpenAI integration
│   ├── gemini-service.ts # Gemini integration
│   └── mongodb.ts        # Database connection
├── models/                # MongoDB models
│   ├── Agent.ts
│   ├── Position.ts
│   └── Trade.ts
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

## 🔐 Security

- **No hardcoded secrets** — All API keys use environment variables
- **Private keys** — Stored securely, never committed to git
- **Environment variables** — Required for all sensitive data
- **API rate limits** — Respects API rate limits for all services

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** — Initial setup guide
- **[SETUP_BACKEND.md](./SETUP_BACKEND.md)** — Backend setup
- **[REAL_TRADING_GUIDE.md](./REAL_TRADING_GUIDE.md)** — Real trading setup
- **[TRADING_SYSTEM.md](./TRADING_SYSTEM.md)** — Trading engine documentation
- **[docs/](./docs/)** — API documentation and guides

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License — Feel free to use this project for learning and development.

## ⚠️ Disclaimer

This project is for **educational and demonstration purposes**. Trading cryptocurrencies involves significant risk. Always:

- Test thoroughly before using real funds
- Start with small amounts
- Understand the risks involved
- Never invest more than you can afford to lose
- Use paper trading mode for learning

**NEURAL/ORDER is not financial advice.** Use at your own risk.

---

Built with ❤️ for the crypto trading community
