# Chart Data Persistence System

## Overview
The chart data now persists across page refreshes by storing balance snapshots in the database every second.

## How It Works

### 1. **BalanceSnapshot Model** (`models/BalanceSnapshot.ts`)
- Stores historical balance snapshots for each agent
- Records: `timestamp`, `agentId`, `agentName`, `balance`, `pnl`, `pnlAbsolute`
- Indexed by timestamp for fast queries

### 2. **Backend Snapshot Saving** (`backend/trading-worker.js`)
- **Frequency:** Every 1 second
- Saves current balance for all agents
- Auto-cleans old snapshots (keeps last 24 hours)
- Logs every 60 seconds to avoid console spam

```javascript
// Added to main() function:
setInterval(async () => {
  await saveBalanceSnapshots();
}, 1000); // Every second
```

### 3. **API Endpoint** (`app/api/balance-snapshots/route.ts`)
- **GET:** Fetch historical snapshots (filterable by time range)
- **POST:** Save snapshots (called by trading worker)

### 4. **Frontend Loading** (`app/page.tsx`)
- On page mount, loads last 1 hour of snapshots from database
- Groups snapshots by timestamp to create chart data
- Continues to update with new real-time data
- Merges historical data with live updates

## Data Flow

1. **Trading Worker** saves snapshot every 1 second
2. **User visits page** - loads historical snapshots from database
3. **Chart displays** - shows both historical and new data
4. **Page refresh** - chart retains historical data!

## Benefits

✅ **Persistent Chart Data** - Never lose chart history on refresh  
✅ **Time-Series View** - See agent balance evolution over time  
✅ **Historical Context** - View up to 24 hours of history  
✅ **Efficient** - Auto-cleans old data, indexed for fast queries  
✅ **Live Updates** - Still updates in real-time while showing history  

## Configuration

### Adjust Snapshot Frequency
Edit `backend/trading-worker.js`:
```javascript
setInterval(async () => {
  await saveBalanceSnapshots();
}, 1000); // Change to 2000 for every 2 seconds, etc.
```

### Adjust Historical Data Load
Edit `app/page.tsx`:
```javascript
const snapshots = await fetchBalanceHistory(1); // Change 1 to hours desired
```

### Adjust Cleanup Period
Edit `app/api/balance-snapshots/route.ts`:
```javascript
// In POST endpoint:
const cutoffTime = timestamp - (24 * 60 * 60 * 1000); // Change 24 to hours desired
```

## Database Schema

```
BalanceSnapshot Collection:
{
  timestamp: 1234567890000,
  agentId: "agent-id-123",
  agentName: "NeuralSniper",
  balance: 10500.25,
  pnl: 5.00,
  pnlAbsolute: 500.25,
  createdAt: Date
}
```

## Notes

- Snapshot saving happens in the backend trading worker
- Frontend automatically loads historical data on mount
- Chart automatically merges historical and live data
- No manual intervention needed!

