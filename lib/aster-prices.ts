/**
 * Aster Price Data Integration
 * Fetches real prices from Aster Futures API
 */

/**
 * Cache for market data to reduce API calls
 */
let priceCache: { data: Record<string, number>; timestamp: number } = { data: {}, timestamp: 0 };
const CACHE_DURATION = 5000; // 5 seconds cache

/**
 * Fetch all current prices from Aster Futures API
 * Returns a map of coin names to prices (e.g., { BTC: 45000, ETH: 2450 })
 */
export async function fetchAllPrices(): Promise<Record<string, number>> {
  // Check cache first
  const now = Date.now();
  if (priceCache.timestamp > 0 && now - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.data;
  }

  try {
    // Fetch real prices from Aster futures API
    const response = await fetch('https://fapi.asterdex.com/fapi/v1/ticker/price');
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from Aster API');
    }

    // Map Aster symbols to our coin names
    const priceMap: Record<string, number> = {};
    
    // Extract all major trading pairs from Aster response
    // Aster uses format like BTCUSDT, ETHUSDT, etc.
    data.forEach((ticker: any) => {
      if (ticker && ticker.symbol && ticker.price) {
        const symbol = ticker.symbol;
        const price = parseFloat(ticker.price);
        
        // Extract coin name from symbol (e.g., BTCUSDT -> BTC)
        // Match common patterns: BTC, ETH, SOL, MATIC, AVAX, ADA, LINK, UNI, etc.
        const coinMatch = symbol.match(/^([A-Z]+)USDT$/);
        if (coinMatch) {
          const coin = coinMatch[1];
          // Only include major coins (length <= 5 to exclude weird tokens)
          if (coin.length <= 5) {
            priceMap[coin] = price;
          }
        }
      }
    });

    // Update cache
    priceCache = {
      data: priceMap,
      timestamp: now,
    };

    return priceMap;
  } catch (error) {
    console.error('Error fetching Aster prices:', error);
    
    // Return cached data if available, otherwise throw error
    if (priceCache.data && Object.keys(priceCache.data).length > 0) {
      console.warn('Using cached prices due to API error');
      return priceCache.data;
    }
    
    throw new Error('Failed to fetch prices from Aster API');
  }
}

/**
 * Get current price for a specific trading pair
 * @param pair - Trading pair in format "COIN/USD" (e.g., "BTC/USD")
 */
export async function getCurrentPrice(pair: string): Promise<number> {
  // Extract coin name from pair (e.g., "BTC/USD" -> "BTC")
  const coin = pair.split('/')[0];
  
  try {
    const prices = await fetchAllPrices();
    
    if (!prices[coin]) {
      throw new Error(`Price not found for ${coin}`);
    }
    
    return prices[coin];
  } catch (error) {
    console.error(`Error getting price for ${pair}:`, error);
    throw error;
  }
}

/**
 * Calculate PnL for a trade
 */
export function calculatePnL(
  side: "long" | "short",
  entryPrice: number,
  exitPrice: number
): number {
  if (side === "long") {
    return ((exitPrice - entryPrice) / entryPrice) * 100;
  } else {
    return ((entryPrice - exitPrice) / entryPrice) * 100;
  }
}

/**
 * Simulate a trade execution with realistic price movement
 */
export async function simulateTradeExecution(
  pair: string,
  side: "long" | "short",
  amount: number
): Promise<{
  entryPrice: number;
  exitPrice: number;
  pnl: number;
}> {
  const entryPrice = await getCurrentPrice(pair);
  
  // Simulate price movement over the trade duration
  const movement = (Math.random() - 0.45) * 2; // Slight negative bias
  const exitPrice = entryPrice * (1 + movement / 100);

  const pnl = calculatePnL(side, entryPrice, exitPrice);

  return {
    entryPrice,
    exitPrice,
    pnl,
  };
}

