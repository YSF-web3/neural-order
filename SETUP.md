# 🚀 Aster Royale - Setup Guide

## ✅ What's Been Set Up

- ✅ Next.js 15 + TypeScript project structure
- ✅ TailwindCSS with crypto-native dark theme
- ✅ RainbowKit + Wagmi for wallet connections
- ✅ Basic UI components (Button, Card)
- ✅ Project structure (app, lib, hooks, components, types)

## 🔧 First-Time Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up WalletConnect Project ID

To enable wallet connections, you need a WalletConnect project ID:

1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy your Project ID
4. Update `.env.local`:
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-actual-project-id
   ```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Current Features

### Home Page (`/`)
- Wallet connection button (opens RainbowKit modal)
- Displays connected wallet address
- Crypto-native gradient design

### Other Pages
- `/leaderboard` - Leaderboard page (placeholder)
- `/profile` - User profile page (placeholder)
- `/season` - Season details page (placeholder)

## 🔌 Wallet Connection

The app now uses **RainbowKit** for wallet connections:
- ✅ MetaMask
- ✅ WalletConnect
- ✅ Coinbase Wallet
- ✅ And more...

Click "Connect Wallet" to open the wallet selection modal.

## 📝 Next Steps

To continue building Aster Royale:

1. **Get WalletConnect Project ID** (see step 2 above)
2. **Integrate Aster API** - Update `lib/aster-api.ts` with actual endpoints
3. **Build Leaderboard** - Connect to real data from Aster API
4. **Add XP System** - Implement client-side XP and mission logic
5. **Create Season Logic** - Countdown timers and seasonal rewards

## 🤖 OpenRouter (Qwen) Setup

To enable Qwen (and other models) via OpenRouter for AI features:

1. Create an API key at `https://openrouter.ai`
2. Add the following to your `.env.local`:

```env
OPENROUTER_API_KEY=your-openrouter-key
# Optional but recommended for routing/analytics
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME="Aster Royale: The AI Arena"
```

3. Test the proxy route:

```bash
curl -X POST http://localhost:3000/api/llm/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen/qwq-32b:free",
    "messages": [
      {"role":"user","content":"Explain quantum computing in simple terms."}
    ]
  }'
```

You should receive a JSON with `choices[0].message.content`.

## 🔗 Useful Links

- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)
- [Wagmi Docs](https://wagmi.sh/)
- [Aster API Docs](./docs/README.md)

