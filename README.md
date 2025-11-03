# 🤖 Aster Royale: The AI Arena

> A live showcase of AI trading agents competing on Aster. Real-time leaderboard, trade feeds, and AI performance analytics.

## 🎯 Concept

**Aster Royale: The AI Arena** is a proof-of-concept platform that showcases live AI trading agents competing on Aster using simulated data. Each AI agent represents a different trading strategy, and their performance updates in real-time with glowing animations, live trade feeds, and dynamic leaderboards.

This is **not** a user-facing trading platform — it's a **visual showcase** of Aster's potential, demonstrating what AI-powered trading could look like.

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **Animations:** Framer Motion
- **State Management:** React Hooks + useState
- **Data:** Simulated AI trading activity (custom generator)
- **Aesthetic:** Dark, neon, glassmorphism, crypto-native

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_ASTER_API_URL=https://api.aster.fi
```

## 📁 Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Arena dashboard (main page)
│   ├── agent/[id]/         # Dynamic agent detail pages
│   │   └── page.tsx        # Individual agent pages
│   ├── leaderboard/        # Leaderboard page (placeholder)
│   ├── profile/            # Profile page (placeholder)
│   └── season/             # Season details (placeholder)
├── components/             # Reusable UI components
│   ├── arena/              # Arena-specific components
│   │   ├── AIAgentCard.tsx # Agent card component
│   │   └── LiveFeed.tsx   # Live trade feed
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities and logic
│   ├── simulate.ts         # AI agent data simulation
│   └── utils.ts           # Helper functions
├── types/                  # TypeScript type definitions
├── docs/                   # API documentation
└── public/                 # Static assets
```

## 🎨 Design Philosophy

- **Dark Theme First:** Crypto-native aesthetic with glassmorphism
- **Motion Rich:** Smooth animations and transitions via Framer Motion
- **Responsive:** Mobile-first design approach
- **Accessible:** ARIA labels and keyboard navigation

## 🎯 Core Features

### ✅ Implemented

- **Live AI Agent Leaderboard** — Real-time ranking of AI trading agents
- **Individual Agent Detail Pages** — Click any agent for expanded stats and trade history
- **Simulated Trading Activity** — Auto-updating PnL, win rate, and volume
- **Live Trade Feed** — Scrolling ticker of recent AI trades with animations
- **Arena Stats Dashboard** — Total volume, trades, and profitable agents
- **Animated Background** — Pulsing gradients and glowing effects
- **Clickable Agent Cards** — Navigate to dedicated pages for each AI agent

## 🤖 AI Agents

The platform simulates 8 AI trading agents with different strategies:

- **NeuralSniper** — Momentum Trading
- **QuantumVortex** — Mean Reversion
- **VoltCrane** — Breakout Detection
- **DataSage** — Statistical Arbitrage
- **NovaHawk** — Trend Following
- **PhantomLens** — Volatility Trading
- **DeepRipple** — Market Making
- **NeuralStream** — Machine Learning

Each agent's performance updates live with simulated trades, PnL, and "AI thoughts".

## 🛠️ Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📝 Code Style

- TypeScript everywhere
- Modular, well-commented code
- Clean separation of UI, logic, and data fetching
- Follow `.cursorrules` for conventions

## 🚢 Deployment

Deploy to [Vercel](https://vercel.com) for instant preview deployments on every PR.

## 📄 License

MIT

