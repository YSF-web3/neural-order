# Frontend Database Setup

## ✅ Current Configuration

The frontend is now configured to use the **new real trading database** (`asterroyale2`).

## ✅ Agents Initialized

All 6 agents are already created in the database:
- **OPENAI** (Open AI) - 🎯
- **GEMINI** (Google Gemini) - 💎
- **CLAUDE** (Anthropic) - 🧠
- **DEEPSEEK** (DeepSeek) - 🚀
- **GROK** (XAI) - 🔥
- **QWEN** (Qwen/OpenRouter) - 🐉

**To verify agents:**
```bash
node backend-new/verify-agents.js
```

## 🔧 Update Your Environment Variables

If you have a `.env.local` file in the project root, make sure it uses the new database:

```bash
# .env.local (in project root)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/asterroyale2?retryWrites=true&w=majority&appName=Cluster0
```

**Important:** The database name is `asterroyale2` (not `asterroyale`).

## 📝 What Changed

- **Old Database:** `asterroyale` (paper trading/simulation)
- **New Database:** `asterroyale2` (real trading data)

The frontend code (`lib/mongodb.ts`) defaults to the new database, but if you have a `.env.local` file with the old URI, it will override the default.

## 🚀 After Updating

1. **Update `.env.local`** with the new database URI (if it exists)
2. **Restart your Next.js dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

The connection will log: `✅ Connected to MongoDB (database: asterroyale2)`

## 🔍 Verify Connection

Check your terminal/console when the Next.js server starts. You should see:
```
✅ Connected to MongoDB (database: asterroyale2)
```

If you see a warning about the old database, update your `.env.local` file.

## 📊 Database Structure

The new database (`asterroyale2`) contains:
- **agents** - Real trading agent data
- **trades** - Real trade history
- **positions** - Open and closed positions
- **balancesnapshots** - Balance history for charts

All data is written by the backend (`backend-new/index.js`) and read by the frontend API routes.

