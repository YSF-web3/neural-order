/**
 * Aster Real Trading Implementation
 * 
 * This file shows how to execute REAL trades using the Aster Futures API v3
 * instead of paper trading. Key differences:
 * 
 * 1. Authentication: Uses Web3 signatures (user, signer, nonce, privateKey)
 * 2. Order Execution: Calls actual Aster API endpoints
 * 3. Position Management: Tracks real positions on Aster
 * 4. Risk Management: Uses real wallet balances
 * 
 * IMPORTANT: This requires:
 * - Agent wallet addresses (user + signer)
 * - Private keys for signing (stored securely)
 * - Real funds in Aster accounts
 * - Careful testing before enabling
 */

import { ethers } from "ethers";

// Aster Futures API v3 base URL
const ASTER_FUTURES_API = "https://fapi.asterdex.com";

/**
 * Agent Wallet Configuration
 * Each agent needs:
 * - user: Main wallet address (where funds are)
 * - signer: API wallet address (for signing orders)
 * - privateKey: Private key of the signer wallet
 * 
 * Store these securely (environment variables, encrypted DB, etc.)
 */
export interface AgentWalletConfig {
  user: string;        // Main account wallet address (0x...)
  signer: string;      // API wallet address (0x...)
  privateKey: string;  // Private key of signer wallet (0x...)
}

/**
 * Aster Order Parameters
 * Based on POST /fapi/v3/order endpoint
 */
export interface AsterOrderParams {
  symbol: string;              // e.g., "BTCUSDT", "ETHUSDT"
  side: "BUY" | "SELL";        // Order direction
  type: "MARKET" | "LIMIT" | "STOP_MARKET" | "TAKE_PROFIT_MARKET";
  positionSide?: "LONG" | "SHORT" | "BOTH";  // Default: "BOTH"
  quantity?: string;           // Order size (required for MARKET/LIMIT)
  price?: string;              // Limit price (required for LIMIT)
  stopPrice?: string;          // Stop price (for STOP/TAKE_PROFIT orders)
  timeInForce?: "GTC" | "IOC" | "FOK" | "GTX";  // Default: "GTC"
  reduceOnly?: string;         // "true" or "false" (for closing positions)
  leverage?: number;           // Leverage multiplier (1-125x)
  newClientOrderId?: string;   // Unique order ID (optional)
  newOrderRespType?: "ACK" | "RESULT";  // Response detail level
}

/**
 * Aster API Order Response
 */
export interface AsterOrderResponse {
  clientOrderId: string;
  cumQty: string;
  cumQuote: string;
  executedQty: string;
  orderId: number;
  avgPrice: string;
  origQty: string;
  price: string;
  reduceOnly: boolean;
  side: string;
  positionSide: string;
  status: "NEW" | "PARTIALLY_FILLED" | "FILLED" | "CANCELED" | "REJECTED" | "EXPIRED";
  stopPrice?: string;
  symbol: string;
  timeInForce: string;
  type: string;
  origType: string;
  updateTime: number;
  workingType?: string;
  priceProtect?: boolean;
}

/**
 * Generate nonce (current timestamp in microseconds)
 */
function generateNonce(): number {
  const now = Date.now();
  return Math.trunc(now * 1000); // Convert to microseconds
}

/**
 * Convert all parameter values to strings and sort by ASCII order
 * Required for Aster API signature generation
 */
function trimAndSortParams(params: Record<string, any>): Record<string, string> {
  const trimmed: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue; // Skip null/undefined values
    }
    
    // Convert all values to strings
    if (Array.isArray(value)) {
      trimmed[key] = JSON.stringify(value.map(v => 
        typeof v === 'object' ? JSON.stringify(v) : String(v)
      ));
    } else if (typeof value === 'object') {
      trimmed[key] = JSON.stringify(value);
    } else {
      trimmed[key] = String(value);
    }
  }
  
  return trimmed;
}

/**
 * Generate signature for Aster API v3
 * 
 * Process:
 * 1. Sort all parameters by ASCII order and convert to JSON string
 * 2. Add timestamp and recvWindow
 * 3. Encode with ABI: [string, address, address, uint256]
 * 4. Hash with Keccak256
 * 5. Sign with private key using ECDSA
 */
export async function generateAsterSignature(
  params: Record<string, any>,
  walletConfig: AgentWalletConfig,
  nonce: number
): Promise<string> {
  // Step 1: Prepare parameters (add timestamp, recvWindow)
  const paramsWithMeta = {
    ...params,
    recvWindow: 50000,  // 50 second window
    timestamp: Math.trunc(Date.now()), // milliseconds
  };
  
  // Step 2: Trim and sort parameters
  const trimmed = trimAndSortParams(paramsWithMeta);
  
  // Step 3: Generate sorted JSON string
  const jsonStr = JSON.stringify(trimmed, Object.keys(trimmed).sort())
    .replace(/\s/g, '')  // Remove whitespace
    .replace(/'/g, '"');  // Ensure double quotes
  
  // Step 4: ABI encode: [string, address, address, uint256]
  // Using ethers ABI encoding
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const encoded = abiCoder.encode(
    ['string', 'address', 'address', 'uint256'],
    [jsonStr, walletConfig.user, walletConfig.signer, BigInt(nonce)]
  );
  
  // Step 5: Keccak256 hash
  const keccakHash = ethers.keccak256(encoded);
  
  // Step 6: Sign with private key using EIP-191 (personal_sign) format
  // This matches the Python eth_account.encode_defunct() behavior
  const wallet = new ethers.Wallet(walletConfig.privateKey);
  
  // Sign the keccak hash directly (Aster expects hash, not message)
  // The Python example uses encode_defunct(hexstr=keccak_hex)
  // which prepares the hash for signing
  const signature = await wallet.signMessage(ethers.getBytes(keccakHash));
  
  return signature;
}

/**
 * Place a real order on Aster Futures API
 * 
 * @param orderParams - Order parameters (symbol, side, type, etc.)
 * @param walletConfig - Agent's wallet configuration
 * @returns Order response from Aster API
 */
export async function placeAsterOrder(
  orderParams: AsterOrderParams,
  walletConfig: AgentWalletConfig
): Promise<AsterOrderResponse> {
  const nonce = generateNonce();
  
  // Prepare parameters for signature
  const paramsForSign = {
    ...orderParams,
    // Convert numeric leverage to string if present
    leverage: orderParams.leverage ? String(orderParams.leverage) : undefined,
  };
  
  // Generate signature
  const signature = await generateAsterSignature(paramsForSign, walletConfig, nonce);
  
  // Prepare final request body
  const requestBody = {
    ...paramsForSign,
    nonce: String(nonce),
    user: walletConfig.user,
    signer: walletConfig.signer,
    signature: signature,
    recvWindow: 50000,
    timestamp: Math.trunc(Date.now()),
  };
  
  // Remove undefined values
  Object.keys(requestBody).forEach(key => {
    const val = (requestBody as any)[key];
    if (val === undefined) {
      delete (requestBody as any)[key];
    }
  });
  
  // Make API request
  const url = `${ASTER_FUTURES_API}/fapi/v3/order`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
        Object.entries(requestBody).map(([k, v]) => [k, String(v)])
      ),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Aster API error (${response.status}): ${errorData.msg || response.statusText}`
      );
    }
    
    const orderData: AsterOrderResponse = await response.json();
    return orderData;
  } catch (error) {
    console.error('Error placing Aster order:', error);
    throw error;
  }
}

/**
 * Close a position (reduce-only order)
 * 
 * @param symbol - Trading pair (e.g., "BTCUSDT")
 * @param side - "BUY" to close short, "SELL" to close long
 * @param quantity - Position size to close
 * @param walletConfig - Agent's wallet configuration
 */
export async function closeAsterPosition(
  symbol: string,
  side: "BUY" | "SELL",
  quantity: string,
  walletConfig: AgentWalletConfig
): Promise<AsterOrderResponse> {
  return await placeAsterOrder({
    symbol,
    side,
    type: "MARKET",
    quantity,
    reduceOnly: "true", // This closes the position
  }, walletConfig);
}

/**
 * Set leverage for a trading pair
 * Note: This requires a separate endpoint (not shown here)
 */
export async function setLeverage(
  symbol: string,
  leverage: number,
  walletConfig: AgentWalletConfig
): Promise<void> {
  // TODO: Implement POST /fapi/v1/leverage endpoint
  // This should be called before placing orders with leverage
  console.log(`Setting leverage ${leverage}x for ${symbol}`);
}

/**
 * Sync agent balance from Aster API
 * 
 * With real trading, balance should be fetched from Aster, not calculated.
 * This function:
 * 1. Fetches real balance from Aster API
 * 2. Updates agent's balance in database
 * 3. Calculates PnL metrics
 * 
 * Use this instead of calculateAgentBalance() when doing real trading.
 * 
 * @param agent - Agent object to update
 * @param walletConfig - Agent's wallet configuration
 * @param initialBalance - Initial balance when agent started (for PnL calculation)
 */
export async function syncBalanceFromAster(
  agent: any,
  walletConfig: AgentWalletConfig,
  initialBalance: number = 1000
): Promise<void> {
  try {
    // Fetch real balance from Aster API
    // This includes:
    // - All realized PnL from closed trades
    // - Unrealized PnL from open positions
    // - Fees and funding costs
    const realBalance = await getAsterAccountBalance(walletConfig);
    
    // Update agent balance with real value from exchange
    agent.balance = realBalance;
    
    // Calculate PnL metrics
    agent.pnlAbsolute = realBalance - initialBalance;
    agent.pnl = (agent.pnlAbsolute / initialBalance) * 100;
    
    // Save updated balance
    await agent.save();
    
    console.log(
      `✓ Synced balance for ${agent.name}: ` +
      `$${realBalance.toFixed(2)} (PnL: ${agent.pnl.toFixed(2)}%)`
    );
  } catch (error) {
    console.error(`Failed to sync balance for ${agent.name}:`, error);
    // Don't throw - allow agent to continue with last known balance
  }
}

/**
 * Aster Account Information Response
 */
export interface AsterAccountInfo {
  feeTier: number;
  canTrade: boolean;
  canDeposit: boolean;
  canWithdraw: boolean;
  updateTime: number;
  totalWalletBalance: string;        // Total balance (includes unrealized PnL)
  totalUnrealizedProfit: string;     // Unrealized profit from open positions
  totalMarginBalance: string;        // Margin balance (wallet + unrealized)
  totalCrossWalletBalance: string;  // Cross wallet balance
  availableBalance: string;          // Available for trading
  maxWithdrawAmount: string;         // Max withdrawal amount
  assets: Array<{
    asset: string;
    walletBalance: string;
    unrealizedProfit: string;
    marginBalance: string;
    crossWalletBalance: string;
    availableBalance: string;
    maxWithdrawAmount: string;
  }>;
  positions: any[];
}

/**
 * Aster Balance Response (simpler than account info)
 */
export interface AsterBalance {
  accountAlias: string;
  asset: string;
  balance: string;                   // Wallet balance
  crossWalletBalance: string;         // Cross wallet balance
  crossUnPnl: string;                 // Unrealized profit of crossed positions
  availableBalance: string;           // Available balance
  maxWithdrawAmount: string;          // Max withdrawal amount
  marginAvailable: boolean;
  updateTime: number;
}

/**
 * Get account balance from Aster API
 * 
 * ⚠️ IMPORTANT: With real trading, you should ALWAYS fetch balance from Aster API,
 * not calculate it manually. The API includes:
 * - Realized PnL from closed trades
 * - Unrealized PnL from open positions
 * - Fees and funding costs
 * - Margin requirements
 * 
 * This is the single source of truth for account balance.
 * 
 * @param walletConfig - Agent's wallet configuration
 * @returns USDT balance as a number
 */
export async function getAsterAccountBalance(
  walletConfig: AgentWalletConfig
): Promise<number> {
  const nonce = generateNonce();
  const params = {
    recvWindow: 50000,
    timestamp: Math.trunc(Date.now()),
  };
  
  const signature = await generateAsterSignature(params, walletConfig, nonce);
  
  // Build query string for GET request
  const queryParams = new URLSearchParams({
    recvWindow: String(params.recvWindow),
    timestamp: String(params.timestamp),
    nonce: String(nonce),
    user: walletConfig.user,
    signer: walletConfig.signer,
    signature: signature,
  });
  
  const url = `${ASTER_FUTURES_API}/fapi/v3/balance?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch balance (${response.status}): ${errorData.msg || response.statusText}`
      );
    }
    
    const balances: AsterBalance[] = await response.json();
    
    // Find USDT balance (or first asset if USDT not found)
    const usdtBalance = balances.find(b => b.asset === 'USDT');
    if (!usdtBalance) {
      throw new Error('USDT balance not found in account');
    }
    
    // Return wallet balance as number
    // Note: This includes unrealized PnL automatically
    return parseFloat(usdtBalance.balance);
  } catch (error) {
    console.error('Error fetching Aster account balance:', error);
    throw error;
  }
}

/**
 * Get full account information from Aster API
 * Includes balance, positions, margin, etc.
 * 
 * Use this if you need detailed account information beyond just balance.
 * 
 * @param walletConfig - Agent's wallet configuration
 * @returns Full account information
 */
export async function getAsterAccountInfo(
  walletConfig: AgentWalletConfig
): Promise<AsterAccountInfo> {
  const nonce = generateNonce();
  const params = {
    recvWindow: 50000,
    timestamp: Math.trunc(Date.now()),
  };
  
  const signature = await generateAsterSignature(params, walletConfig, nonce);
  
  const queryParams = new URLSearchParams({
    recvWindow: String(params.recvWindow),
    timestamp: String(params.timestamp),
    nonce: String(nonce),
    user: walletConfig.user,
    signer: walletConfig.signer,
    signature: signature,
  });
  
  const url = `${ASTER_FUTURES_API}/fapi/v3/account?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch account info (${response.status}): ${errorData.msg || response.statusText}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Aster account info:', error);
    throw error;
  }
}

/**
 * Get current positions from Aster API
 * 
 * @param walletConfig - Agent's wallet configuration
 * @returns Array of open positions
 */
export async function getAsterPositions(
  walletConfig: AgentWalletConfig
): Promise<any[]> {
  // Get full account info which includes positions
  const accountInfo = await getAsterAccountInfo(walletConfig);
  
  // Filter to only open positions (non-zero size)
  return accountInfo.positions.filter(
    (pos: any) => parseFloat(pos.positionAmt) !== 0
  );
}

/**
 * Convert agent decision to Aster order parameters
 * 
 * This bridges your current paper trading system to real trading
 */
export function convertDecisionToAsterOrder(
  decision: any,
  marketPrice: number
): AsterOrderParams {
  const { trade_signal_args } = decision;
  const { coin, signal, size_usd, leverage, stop_loss, profit_target } = trade_signal_args;
  
  // Convert coin to Aster symbol format (e.g., "BTC" -> "BTCUSDT")
  const symbol = `${coin}USDT`;
  
  // Convert signal to Aster side
  const side = signal === "long" ? "BUY" : "SELL";
  
  // Calculate quantity from USD size
  // quantity = size_usd / price
  const quantity = (size_usd / marketPrice).toFixed(8);
  
  // Market order for immediate execution
  const orderParams: AsterOrderParams = {
    symbol,
    side,
    type: "MARKET",
    quantity,
    positionSide: "BOTH",
  };
  
  // Set leverage if provided (must be set separately via leverage endpoint)
  if (leverage && leverage > 1) {
    orderParams.leverage = leverage;
  }
  
  // Note: Stop loss and take profit would be set as separate orders
  // using STOP_MARKET and TAKE_PROFIT_MARKET order types
  
  return orderParams;
}

/**
 * Execute real trade using Aster API
 * 
 * This replaces the paper trading executeTrade function
 */
export async function executeRealTrade(
  decision: any,
  marketPrice: number,
  walletConfig: AgentWalletConfig
): Promise<{
  success: boolean;
  orderResponse?: AsterOrderResponse;
  error?: string;
}> {
  try {
    // Convert decision to Aster order format
    const orderParams = convertDecisionToAsterOrder(decision, marketPrice);
    
    // Set leverage if needed (call separate endpoint first)
    if (orderParams.leverage) {
      await setLeverage(orderParams.symbol, orderParams.leverage, walletConfig);
    }
    
    // Place the order
    const orderResponse = await placeAsterOrder(orderParams, walletConfig);
    
    // Check if order was filled
    if (orderResponse.status === "FILLED" || orderResponse.status === "PARTIALLY_FILLED") {
      // Optionally place stop loss and take profit orders
      const { stop_loss, profit_target } = decision.trade_signal_args;
      
      if (stop_loss) {
        // Place stop loss order
        await placeAsterOrder({
          symbol: orderParams.symbol,
          side: orderParams.side === "BUY" ? "SELL" : "BUY", // Opposite side
          type: "STOP_MARKET",
          stopPrice: String(stop_loss),
          quantity: orderResponse.executedQty || orderParams.quantity,
          reduceOnly: "true",
        }, walletConfig);
      }
      
      if (profit_target) {
        // Place take profit order
        await placeAsterOrder({
          symbol: orderParams.symbol,
          side: orderParams.side === "BUY" ? "SELL" : "BUY", // Opposite side
          type: "TAKE_PROFIT_MARKET",
          stopPrice: String(profit_target),
          quantity: orderResponse.executedQty || orderParams.quantity,
          reduceOnly: "true",
        }, walletConfig);
      }
    }
    
    return {
      success: true,
      orderResponse,
    };
  } catch (error: any) {
    console.error('Real trade execution failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Get wallet configuration for an agent
 * 
 * Supports two strategies:
 * 1. Individual wallet per agent (recommended for competition)
 * 2. Shared wallet for all agents (simpler, but no real competition)
 * 
 * @param agent - Agent object
 * @returns Wallet config or null if paper trading
 */
export function getAgentWalletConfig(agent: any): AgentWalletConfig | null {
  // If agent is configured for paper trading, return null
  if (agent.isPaperTrading !== false) {
    return null;
  }
  
  // Strategy 1: Individual wallet per agent (recommended)
  // Each agent has its own wallet addresses stored in agent object or env
  if (agent.asterUserAddress && agent.asterSignerAddress) {
    const privateKey = process.env[`AGENT_${agent.name.toUpperCase()}_PRIVATE_KEY`] ||
                       process.env[`AGENT_${agent.name}_PRIVATE_KEY`];
    
    if (privateKey) {
      return {
        user: agent.asterUserAddress,
        signer: agent.asterSignerAddress,
        privateKey: privateKey,
      };
    }
  }
  
  // Strategy 2: Shared wallet (fallback or if using one key for all)
  const sharedUser = process.env.SHARED_ASTER_USER;
  const sharedSigner = process.env.SHARED_ASTER_SIGNER;
  const sharedPrivateKey = process.env.SHARED_ASTER_PRIVATE_KEY;
  
  if (sharedUser && sharedSigner && sharedPrivateKey) {
    console.warn(
      `⚠️  Using shared wallet for ${agent.name}. ` +
      `For true competition, use individual wallets per agent.`
    );
    return {
      user: sharedUser,
      signer: sharedSigner,
      privateKey: sharedPrivateKey,
    };
  }
  
  // No wallet config found - will fall back to paper trading
  return null;
}

/**
 * Example: How to integrate this into your trading worker
 * 
 * In backend/trading-worker.js:
 * 
 * const { 
 *   executeRealTrade, 
 *   getAgentWalletConfig, 
 *   syncBalanceFromAster,
 *   getAsterPositions 
 * } = require('./lib/aster-real-trading');
 * 
 * async function processAgentTrade(agent, decision, marketPrice) {
 *   // Get wallet config (returns null if paper trading)
 *   const walletConfig = getAgentWalletConfig(agent);
 *   
 *   if (walletConfig) {
 *     // REAL TRADING MODE
 *     const result = await executeRealTrade(decision, marketPrice, walletConfig);
 *     
 *     if (result.success) {
 *       // ⚠️ IMPORTANT: Sync balance from Aster API (not calculated!)
 *       // This gets the REAL balance including unrealized PnL
 *       await syncBalanceFromAster(agent, walletConfig, INITIAL_BALANCE);
 *       
 *       // Sync positions from Aster API to MongoDB
 *       const asterPositions = await getAsterPositions(walletConfig);
 *       await syncAsterPositionsToDB(agent, asterPositions);
 *     }
 *   } else {
 *     // PAPER TRADING MODE (existing code)
 *     // Calculate balance from trades/positions
 *     const result = executeTrade(agent, decision, marketPrice);
 *     const newBalance = await calculateAgentBalance(agent, marketData);
 *     agent.balance = newBalance;
 *     // ... existing paper trading logic
 *   }
 * }
 * 
 * // Update balance periodically for all agents (every 30 seconds)
 * async function updateAllAgentBalances() {
 *   for (const agent of agents) {
 *     const walletConfig = getAgentWalletConfig(agent);
 *     
 *     if (walletConfig) {
 *       // Real trading: Fetch from Aster API
 *       await syncBalanceFromAster(agent, walletConfig, INITIAL_BALANCE);
 *     } else {
 *       // Paper trading: Calculate from trades
 *       const balance = await calculateAgentBalance(agent, marketData);
 *       agent.balance = balance;
 *       await agent.save();
 *     }
 *   }
 * }
 * 
 * Environment Variables Setup:
 * 
 * Option 1 - Individual wallets (recommended):
 * AGENT_NEURALSNIPER_USER=0x111...
 * AGENT_NEURALSNIPER_SIGNER=0x222...
 * AGENT_NEURALSNIPER_PRIVATE_KEY=0x333...
 * 
 * Option 2 - Shared wallet:
 * SHARED_ASTER_USER=0x111...
 * SHARED_ASTER_SIGNER=0x222...
 * SHARED_ASTER_PRIVATE_KEY=0x333...
 */

