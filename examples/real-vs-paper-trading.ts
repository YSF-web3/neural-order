/**
 * Side-by-Side Comparison: Paper Trading vs Real Trading
 * 
 * This file shows the exact differences in code structure
 */

// ============================================
// PAPER TRADING (Current System)
// ============================================

/**
 * Paper Trading: Simple execution in memory/DB
 */
function executePaperTrade(
  agent: any,
  decision: any,
  marketPrice: number
) {
  // 1. Extract trade parameters
  const { coin, signal, size_usd, leverage, stop_loss, profit_target } = 
    decision.trade_signal_args;
  
  // 2. Create position object (no API call)
  const newPosition = {
    coin,
    entry_price: marketPrice,
    current_price: marketPrice,
    profit_target,
    stop_loss,
    leverage,
    size_usd,
    signal, // "long" | "short"
    opened_at: Date.now(),
    expected_duration: decision.trade_signal_args.expected_duration,
  };
  
  // 3. Update agent balance (calculated, not real)
  agent.balance -= (size_usd / leverage); // Margin used
  
  // 4. Save to database
  agent.activePositions.push(newPosition);
  agent.save();
  
  return { success: true, newPosition };
}

/**
 * Paper Trading: Close position
 */
function closePaperPosition(
  agent: any,
  position: any,
  exitPrice: number
) {
  // 1. Calculate PnL (in memory)
  const priceChange = ((exitPrice - position.entry_price) / position.entry_price) * 100;
  const pnl = position.signal === "long" ? priceChange : -priceChange;
  const pnlAbsolute = (pnl / 100) * position.size_usd;
  
  // 2. Update balance (calculated)
  agent.balance += pnlAbsolute;
  
  // 3. Remove from active positions (DB only)
  agent.activePositions = agent.activePositions.filter(
    p => p.coin !== position.coin
  );
  
  agent.save();
  
  return { success: true, pnl, pnlAbsolute };
}

// ============================================
// REAL TRADING (Aster API)
// ============================================

/**
 * Real Trading: Execute via Aster API
 */
async function executeRealTrade(
  agent: any,
  decision: any,
  marketPrice: number,
  walletConfig: {
    user: string;      // Main wallet address
    signer: string;    // API wallet address
    privateKey: string; // Signer private key
  }
) {
  // 1. Extract trade parameters
  const { coin, signal, size_usd, leverage, stop_loss, profit_target } = 
    decision.trade_signal_args;
  
  // 2. Convert to Aster format
  const symbol = `${coin}USDT`; // "BTC" -> "BTCUSDT"
  const side = signal === "long" ? "BUY" : "SELL";
  const quantity = (size_usd / marketPrice).toFixed(8);
  
  // 3. Generate Web3 signature (required for Aster API)
  const nonce = Math.trunc(Date.now() * 1000);
  const params = {
    symbol,
    side,
    type: "MARKET",
    quantity,
    positionSide: "BOTH",
    timestamp: Date.now(),
    recvWindow: 50000,
  };
  
  // 4. Sign order (Web3 cryptography)
  const signature = await generateAsterSignature(params, walletConfig, nonce);
  
  // 5. Place order on Aster exchange (REAL MONEY)
  const response = await fetch('https://fapi.asterdex.com/fapi/v3/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      ...params,
      nonce: String(nonce),
      user: walletConfig.user,
      signer: walletConfig.signer,
      signature: signature,
    }),
  });
  
  const orderResponse = await response.json();
  
  // 6. If order filled, place stop loss/take profit orders
  if (orderResponse.status === "FILLED") {
    // Place stop loss order on Aster
    if (stop_loss) {
      await placeStopLossOrder(symbol, side, stop_loss, quantity, walletConfig);
    }
    
    // Place take profit order on Aster
    if (profit_target) {
      await placeTakeProfitOrder(symbol, side, profit_target, quantity, walletConfig);
    }
  }
  
  // 7. Sync position from Aster to database
  const asterPositions = await getAsterPositions(walletConfig);
  
  // 8. Update agent with real position data
  agent.activePositions = asterPositions.map(pos => ({
    coin: pos.symbol.replace('USDT', ''),
    entry_price: parseFloat(pos.entryPrice),
    current_price: parseFloat(pos.markPrice),
    // ... map Aster position fields
  }));
  
  // 9. Get real balance from Aster account
  const realBalance = await getAsterAccountBalance(walletConfig);
  agent.balance = realBalance; // Real balance, not calculated
  
  agent.save();
  
  return { 
    success: true, 
    orderResponse,
    realBalance,
  };
}

/**
 * Real Trading: Close position via Aster API
 */
async function closeRealPosition(
  agent: any,
  position: any,
  walletConfig: any
) {
  // 1. Get current position from Aster
  const asterPositions = await getAsterPositions(walletConfig);
  const asterPosition = asterPositions.find(
    p => p.symbol === `${position.coin}USDT`
  );
  
  if (!asterPosition) {
    throw new Error('Position not found on Aster');
  }
  
  // 2. Place reduce-only close order on Aster
  const closeSide = position.signal === "long" ? "SELL" : "BUY";
  const quantity = asterPosition.positionAmt;
  
  const orderResponse = await placeAsterOrder({
    symbol: `${position.coin}USDT`,
    side: closeSide,
    type: "MARKET",
    quantity: Math.abs(quantity).toFixed(8),
    reduceOnly: "true", // This closes the position
  }, walletConfig);
  
  // 3. Wait for order to fill
  // (in production, poll order status or use WebSocket)
  
  // 4. Get updated balance from Aster (real balance)
  const realBalance = await getAsterAccountBalance(walletConfig);
  
  // 5. Remove position from local DB
  agent.activePositions = agent.activePositions.filter(
    p => p.coin !== position.coin
  );
  agent.balance = realBalance;
  
  agent.save();
  
  return { success: true, realBalance };
}

// ============================================
// KEY DIFFERENCES SUMMARY
// ============================================

/*
PAPER TRADING:
✅ Simple: Just update database
✅ Safe: No real money
✅ Fast: No API calls
✅ Flexible: Easy to test
❌ Not real: Positions don't exist on exchange
❌ Balance is calculated, not actual

REAL TRADING:
✅ Real: Actual orders on Aster
✅ Real balance from exchange
✅ Positions exist on order book
❌ Complex: Requires Web3 signatures
❌ Risk: Real money at stake
❌ Slower: API calls required
❌ Errors: Network issues, API failures
*/

// ============================================
// MIGRATION EXAMPLE
// ============================================

/**
 * Unified function that supports both modes
 */
export async function executeTrade(
  agent: any,
  decision: any,
  marketPrice: number,
  walletConfig?: any
) {
  // Check if agent is configured for real trading
  if (agent.isPaperTrading === false && walletConfig) {
    // REAL TRADING MODE
    return await executeRealTrade(agent, decision, marketPrice, walletConfig);
  } else {
    // PAPER TRADING MODE (default)
    return executePaperTrade(agent, decision, marketPrice);
  }
}

// Usage:
const result = await executeTrade(
  agent,
  decision,
  45000,
  agent.isPaperTrading === false ? {
    user: agent.asterUserAddress,
    signer: agent.asterSignerAddress,
    privateKey: process.env[`AGENT_${agent.name}_PRIVATE_KEY`],
  } : undefined
);

