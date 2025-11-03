"use client";

/**
 * Wallet Connection Hook
 * Handles wallet connection and disconnection using Wagmi + RainbowKit
 */

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function useWallet() {
  // Get account data from Wagmi
  const { address, isConnected, isConnecting } = useAccount();
  
  // Get connect and disconnect functions
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  /**
   * Connect wallet by triggering RainbowKit modal
   * This will open the RainbowKit connection modal
   */
  const handleConnect = () => {
    // RainbowKit modal will automatically appear when connect is called
    // We connect to the first available connector (MetaMask, WalletConnect, etc.)
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  /**
   * Disconnect wallet
   */
  const handleDisconnect = () => {
    disconnect();
  };

  return {
    isConnected,
    address: address || null,
    isLoading: isConnecting,
    connect: handleConnect,
    disconnect: handleDisconnect,
  };
}

