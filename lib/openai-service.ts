/**
 * OpenAI Service
 * Handles AI-powered trading decisions for agents
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate trading decision using AI
 * Uses agent's custom prompt to analyze market data
 */
export async function generateAITradingDecision(
  agentPrompt: string,
  marketData: any,
  activePositions: any[],
  agentBalance: number
): Promise<any> {
  const systemPrompt = agentPrompt || `You are a crypto market trader analyzing market data every 30 seconds. Make strategic decisions based on multi-timeframe analysis and broader market context.

### TRADING RULES
• No closing early unless invalidation triggers
• No pyramiding (1 position per symbol)
• Multiple symbols allowed if **total exposure ≤ 70%**
• Min hold: 2.5min
• Open new trade only if no active position in that symbol

### SIGNAL TYPES
• **LONG / SHORT** → Strong setup (confidence ≥ 0.6)
• **CLOSE** → Invalidation triggered OR confidence ≤ 0.5
• **HOLD** → Maintain existing position (valid only if position open)
• **WAIT** → No position + no clear setup

### OUTPUT (JSON ONLY, NO MARKDOWN)
{
  "decisions": {
    "COIN": {
      "trade_signal_args": {
        "coin": "COIN",
        "signal": "wait|hold|long|short|close",
        "quantity": <size_usd>,
        "entry_price": <current_price>,
        "profit_target": <float>,
        "stop_loss": <float>,
        "invalidation_condition": "<condition>",
        "leverage": <5|8|10|12|15|20>,
        "confidence": <0-1>,
        "risk_usd": <float>,
        "size_usd": <float>,
        "expected_duration": "<15min|30min|60min|2h_to_8h>",
        "justification": "<multi-timeframe observation>"
      }
    }
  },
  "conclusion": "<snapshot of current setups, positions, and next watchpoints>"
}`;

  const userMessage = `Analyze this market data and make trading decisions:

### CURRENT MARKET DATA
${JSON.stringify(marketData, null, 2)}

### ACTIVE POSITIONS
${JSON.stringify(activePositions, null, 2)}

### BALANCE
$${agentBalance.toFixed(2)}

### INSTRUCTIONS
Return ONLY valid JSON with trading decisions for each coin (BTC, ETH, SOL, MATIC, AVAX, ADA).
For positions that need to close, signal "close".
For positions to maintain, signal "hold".
For new setups, signal "long" or "short".
For no action, signal "wait".

Return JSON only, no markdown.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using cheaper model for testing
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON from response (might have markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    const decision = JSON.parse(jsonStr);

    return decision;
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback to simple decision
    return {
      decisions: {},
      conclusion: "AI decision generation failed",
    };
  }
}

