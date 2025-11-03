/**
 * Check total trades in database
 * Run: node scripts/check-trades.js
 */

const mongoose = require('mongoose');

// Connect to MongoDB (using same URI as backend)
const MONGODB_URI = process.env.MONGODB_URI || '';

// Trade Schema
const tradeSchema = new mongoose.Schema({
  agentId: String,
  agentName: String,
  pair: String,
  side: String,
  amount: Number,
  price: Number,
  pnl: Number,
  timestamp: Number,
  tradeType: String,
}, { timestamps: true });

const Trade = mongoose.model('Trade', tradeSchema);

async function checkTrades() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Count all exit trades
    const exitTrades = await Trade.find({ tradeType: 'exit' });
    console.log(`Total exit trades in database: ${exitTrades.length}`);

    // Count by agent
    const agents = {};
    exitTrades.forEach(trade => {
      if (!agents[trade.agentName]) {
        agents[trade.agentName] = 0;
      }
      agents[trade.agentName]++;
    });

    console.log('\nBreakdown by agent:');
    Object.entries(agents).forEach(([name, count]) => {
      console.log(`  ${name}: ${count} trades`);
    });

    // Check for duplicates
    const timestamps = exitTrades.map(t => t.timestamp);
    const uniqueTimestamps = new Set(timestamps);
    console.log(`\nUnique timestamps: ${uniqueTimestamps.size}`);
    console.log(`Total trade records: ${timestamps.length}`);
    
    if (timestamps.length !== uniqueTimestamps.size) {
      console.log(`⚠️  Warning: Possible duplicate trades detected`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTrades();

