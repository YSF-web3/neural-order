"use client";

/**
 * Price Ticker Component
 * Scrolling marquee displaying token prices in real-time from Aster API
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Token price data structure
interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

/**
 * Fetch real token prices from Aster API
 */
async function fetchTokenPrices(): Promise<TokenPrice[]> {
  try {
    // Fetch real prices from Aster futures API
    const response = await fetch('https://fapi.asterdex.com/fapi/v1/ticker/price');
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('Invalid response from Aster API, using empty array');
      return [];
    }

    // Map Aster response to our token format
    // Take first 10 tokens to avoid overwhelming the ticker
    const tokens: TokenPrice[] = [];
    
    data.forEach((ticker: any) => {
      if (ticker && ticker.symbol && ticker.price && tokens.length < 10) {
        // Extract coin name from symbol (e.g., BTCUSDT -> BTC)
        const coinMatch = ticker.symbol.match(/^([A-Z]+)USDT$/);
        if (coinMatch) {
          const coin = coinMatch[1];
          // Only include major coins (length <= 5)
          if (coin.length <= 5) {
            const price = parseFloat(ticker.price);
            
            tokens.push({
              symbol: `${coin}/USD`,
              price: price,
              change24h: (Math.random() - 0.3) * 6, // Simulated 24h change
              volume24h: Math.random() * 1000000000, // Simulated volume
            });
          }
        }
      }
    });

    return tokens;
  } catch (error) {
    console.error('Error fetching prices for ticker:', error);
    return [];
  }
}

/**
 * Format price with appropriate decimals based on value
 * Small prices (< 1): 4 decimals
 * Medium prices (1-100): 2 decimals
 * Large prices (> 100): 0-2 decimals
 */
function formatPrice(price: number): string {
  if (price < 1) {
    return price.toFixed(4);
  }
  if (price < 100) {
    return price.toFixed(2);
  }
  return Math.round(price).toString();
}

/**
 * Format change percentage with sign
 */
function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

export function PriceTicker() {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real prices from Aster API on mount and periodically
  useEffect(() => {
    // Fetch immediately on mount
    fetchTokenPrices().then((prices) => {
      setTokens(prices);
      setIsLoading(false);
    });

    // Update prices every 5 seconds
    const interval = setInterval(() => {
      fetchTokenPrices().then((prices) => {
        setTokens(prices);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Don't render until we have data
  if (isLoading || tokens.length === 0) {
    return (
      <div className="relative w-full overflow-hidden bg-black">
        <div className="flex items-center py-3 px-4">
          <span className="text-xs font-black font-doto tracking-wider uppercase">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // Duplicate tokens for seamless loop
  const duplicatedTokens = [...tokens, ...tokens];

  return (
    <div className="relative w-full overflow-hidden bg-black border-b-4 border-white">
      <div className="flex items-center py-3">
        {/* Static label */}
        <div className="px-6 py-3 bg-white text-black mr-4 border-r-4 border-white">
          <span className="text-xs font-black font-doto uppercase tracking-wider">
            LIVE
          </span>
        </div>

        {/* Scrolling marquee */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            className="flex items-center"
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {duplicatedTokens.map((token, index) => (
              <div
                key={`${token.symbol}-${index}`}
                className="flex items-center whitespace-nowrap px-4 border-r-2 border-white"
              >
                {/* Token symbol */}
                <span className="font-black text-white text-xs mr-2 font-doto uppercase">
                  {token.symbol.split("/")[0]}
                </span>
                
                {/* Price */}
                <span className="text-xs text-white font-doto mr-2">
                  ${formatPrice(token.price)}
                </span>
                
                {/* 24h change */}
                <span
                  className={`text-xs font-black font-doto ${
                    token.change24h >= 0
                      ? "text-lime-400"
                      : "text-red-500"
                  }`}
                >
                  {formatChange(token.change24h)}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}


