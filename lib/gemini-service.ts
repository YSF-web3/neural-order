/**
 * Gemini Service
 * Handles AI-powered trading decisions using Google's Gemini API
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API key - must be set via environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate trading decision using Gemini AI
 * Matches the same format as OpenAI service for consistency
 */
export async function generateGeminiTradingDecision(
  agentPrompt: string,
  marketData: any,
  activePositions: any[],
  agentBalance: number
): Promise<any> {
  // Use agent's custom prompt if available, otherwise use generic trading prompt
  const agentPromptText = agentPrompt || `You are a professional crypto trader managing a portfolio. Every 30 seconds you analyze market conditions and make trading decisions.

### YOUR ROLE
You are a professional trader with a strategy. Your job is to maximize profits while managing risk.

### CRITICAL: CHECK OPEN POSITIONS FIRST
Before opening new trades, ALWAYS evaluate your open positions:
1. Calculate unrealized PnL for each position (current price vs entry price)
2. Check if stop loss or take profit targets are hit
3. Decide if positions should be closed due to:
   - Strong profit target hit (take profit)
   - Stop loss triggered
   - Trend reversal or invalidation
   - Risk management (max exposure limit)

### TRADING RULES
• Max exposure: 70% of portfolio (total of all positions)
• No pyramiding: 1 position per symbol maximum
• Stop loss and take profit: Calculate based on volatility (typically 1-2% for stop, 2-3% for profit)
• Position sizing: Based on confidence (higher confidence = larger size, up to 20% of balance)
• Leverage: Use leverage carefully (5x to 20x depending on volatility)

### DECISION PRIORITY
1. **FIRST**: Check if any open positions need closing (stop loss hit, take profit hit, trend reversal)
2. **SECOND**: If exposure < 70%, look for new opportunities
3. **THIRD**: If all positions are healthy and no clear setup, do nothing

### YOUR DECISION OUTPUT
You must output a single JSON with ONE decision:
- Close a position (if stop loss/take profit/trend reversal)
- Open a new position (if strong setup and exposure available)
- Do nothing (if no clear setup or all positions healthy)

The decision must have a detailed reasoning explaining your thought process.`;

  const systemPrompt = `${agentPromptText}

### OUTPUT FORMAT (JSON ONLY, NO MARKDOWN)

You MUST output **only** a single JSON object (no text, no explanation, no markdown). The JSON must exactly follow the schema described below. If you cannot (or should not) emit a trade, you MUST return a "none" action JSON (see schema). Do not include any keys other than the ones in the schema.

Schema (all keys are required; use null for values that don't apply):

{
  "action": string,           // one of: "open", "close", "modify", "cancel", "none"
  "orderType": string,        // one of: "market", "limit", "stop", "take_profit", "stop_limit"
  "symbol": string,           // trading symbol, e.g. "BTC", "ETH", "SOL", "MATIC"
  "side": string,             // one of: "buy", "sell" (or "long","short" allowed but normalize to buy/sell)
  "size": number|null,        // absolute asset amount (e.g. 1.25) or null if using "sizePct"
  "sizePct": number|null,     // size as percent of available equity (0-100), null if using size
  "price": number|null,       // limit or stop price; null for market orders
  "leverage": number|null,    // leverage multiplier (1 for no leverage), null if N/A
  "takeProfit": number|null,  // TP price in quote currency, null if none
  "stopLoss": number|null,    // SL price in quote currency, null if none
  "clientOrderId": string|null,// optional id used to track this order client-side
  "reduceOnly": boolean,      // true if order must only reduce position size
  "postOnly": boolean,        // true if limit order must not take liquidity
  "timeInForce": string|null, // e.g. "GTC","IOC","FOK", null if default
  "simulate": boolean,        // true if this is paper/simulated trade (not to broadcast)
  "confidence": number,       // model confidence 0.0 - 1.0 (float)
  "reason": string|null,      // brief single-sentence reason for the trade decision
  "timestamp": string         // ISO 8601 UTC timestamp when decision was made
}

Rules and behavior:
1. ALL fields must appear. Use \`null\` for fields that are not applicable.
2. Side should be "buy" for opening/adding to a long, and "sell" for opening/adding to a short/closing a long (normalize if user uses "long"/"short").
3. If \`sizePct\` is used, \`size\` must be null. If \`size\` is used, \`sizePct\` should be null.
4. For \`action:"close"\` set size to the amount to close (or null + sizePct to close a percent), set reduceOnly=true.
5. \`simulate:true\` must be set for paper trading / demo mode.
6. \`confidence\` should reflect the agent's internal belief (0.0 to 1.0).
7. \`reason\` must be a detailed explanation (3-5 sentences) describing the rationale. Include:
   - What you analyzed (market conditions, open positions, unrealized PnL)
   - Why you made this specific decision
   - What factors influenced the decision (entry/exit prices, stop loss distance, market trend)
   - What you expect to happen (price movement, profit potential, risk)
8. Timestamp must be ISO 8601 in UTC, e.g. "2025-10-27T01:23:45Z".
9. If the correct output is to do nothing (no trade recommended), return \`{"action":"none", ...}\` where \`reason\` explains why (e.g., "no clear edge", "cooldown", "insufficient liquidity").
10. DO NOT output any extra fields or any commentary outside the JSON.`;

  // Calculate unrealized PnL for each open position
  const positionsWithPnL = (activePositions || []).map(pos => {
    const currentPrice = marketData.prices[pos.coin] || pos.current_price;
    const entryPrice = pos.entry_price;
    const priceChange = ((currentPrice - entryPrice) / entryPrice) * 100;
    const unrealizedPnL = pos.signal === 'long' ? priceChange : -priceChange;
    const unrealizedPnLAbsolute = (unrealizedPnL / 100) * pos.size_usd;
    
    return {
      ...pos,
      current_price: currentPrice,
      unrealizedPnL: parseFloat(unrealizedPnL.toFixed(2)),
      unrealizedPnLAbsolute: parseFloat(unrealizedPnLAbsolute.toFixed(2)),
      // Calculate distance to stop loss and take profit
      distanceToStopLoss: pos.signal === 'long' 
        ? ((currentPrice - pos.stop_loss) / pos.stop_loss * 100).toFixed(2)
        : ((pos.stop_loss - currentPrice) / pos.stop_loss * 100).toFixed(2),
      distanceToTakeProfit: pos.signal === 'long'
        ? ((pos.profit_target - currentPrice) / currentPrice * 100).toFixed(2)
        : ((currentPrice - pos.profit_target) / pos.profit_target * 100).toFixed(2),
    };
  });

  // Calculate total exposure
  const totalExposure = positionsWithPnL.reduce((sum, p) => sum + (p.size_usd || 0), 0);
  const exposurePercent = (totalExposure / agentBalance) * 100;
  const remainingCapacity = agentBalance * 0.7 - totalExposure;

  const userMessage = `📊 MARKET ANALYSIS - ${new Date().toISOString()}

=== CURRENT MARKET PRICES ===
${Object.entries(marketData.prices).map(([coin, price]) => `  ${coin}: $${parseFloat(price).toFixed(2)}`).join('\n')}

=== YOUR CURRENT PORTFOLIO ===
Balance: $${agentBalance.toFixed(2)}
Total Exposure: $${totalExposure.toFixed(2)} (${exposurePercent.toFixed(1)}% of balance)
Remaining Capacity: $${remainingCapacity.toFixed(2)}

=== YOUR OPEN POSITIONS (${positionsWithPnL.length} active) ===
${positionsWithPnL.length > 0 ? positionsWithPnL.map((pos, idx) => `
Position #${idx + 1}: ${pos.coin} ${pos.signal.toUpperCase()}
  Entry Price: $${pos.entry_price.toFixed(2)}
  Current Price: $${pos.current_price.toFixed(2)}
  Unrealized PnL: ${pos.unrealizedPnL > 0 ? '+' : ''}${pos.unrealizedPnL}% ($${pos.unrealizedPnLAbsolute > 0 ? '+' : ''}${pos.unrealizedPnLAbsolute.toFixed(2)})
  Size: $${pos.size_usd.toFixed(2)} (${pos.leverage}x leverage)
  Stop Loss: $${pos.stop_loss.toFixed(2)} (${pos.distanceToStopLoss}% away)
  Take Profit: $${pos.profit_target.toFixed(2)} (${pos.distanceToTakeProfit}% away)
  Opened: ${new Date(pos.opened_at).toISOString()}
  AI Confidence: ${(pos.confidence * 100).toFixed(0)}%
`).join('\n') : 'No open positions.'}

=== YOUR OPTIONS ===
1. Close an existing position (if stop loss/take profit hit, or trend reversal)
2. Open a new position (if strong setup available and exposure < 70%)
3. Do nothing (if positions are healthy and no clear setup)

=== AVAILABLE COINS FOR TRADING ===
${Object.keys(marketData.prices).map(coin => `  - ${coin}`).join('\n')}

=== INSTRUCTIONS ===
Analyze your portfolio carefully:
1. Check each open position - should it be closed?
2. Check market conditions - any strong new opportunities?
3. Consider your risk limits - total exposure must stay ≤ 70%

Provide detailed reasoning for your decision. Be specific about:
- Why you're closing a position (stop loss hit? take profit? trend reversal?)
- Why you're opening a position (what's the setup? why now?)
- Why you're doing nothing (waiting for better setup? positions already good?)

Return ONE JSON decision. All fields required.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] },
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Parse JSON from response (might have markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const decision = JSON.parse(jsonStr);
    
    // Ensure all required fields exist
    const timestamp = new Date().toISOString();
    return {
      action: decision.action || 'none',
      orderType: decision.orderType || 'market',
      symbol: decision.symbol || null,
      side: decision.side || null,
      size: decision.size || null,
      sizePct: decision.sizePct || null,
      price: decision.price || null,
      leverage: decision.leverage || null,
      takeProfit: decision.takeProfit || null,
      stopLoss: decision.stopLoss || null,
      clientOrderId: decision.clientOrderId || null,
      reduceOnly: decision.reduceOnly !== undefined ? decision.reduceOnly : false,
      postOnly: decision.postOnly !== undefined ? decision.postOnly : false,
      timeInForce: decision.timeInForce || null,
      simulate: decision.simulate !== undefined ? decision.simulate : true,
      confidence: decision.confidence || 0.5,
      reason: decision.reason || 'AI decision error',
      timestamp: decision.timestamp || timestamp,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    // Return proper "none" action with all required fields
    return {
      action: 'none',
      orderType: 'market',
      symbol: null,
      side: null,
      size: null,
      sizePct: null,
      price: null,
      leverage: null,
      takeProfit: null,
      stopLoss: null,
      clientOrderId: null,
      reduceOnly: false,
      postOnly: false,
      timeInForce: null,
      simulate: true,
      confidence: 0.0,
      reason: 'AI error occurred',
      timestamp: new Date().toISOString(),
    };
  }
}

