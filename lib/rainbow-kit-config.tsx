"use client";

/**
 * RainbowKit Configuration
 * Sets up wallet connection providers for the Aster network
 */

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { rainbowKitTheme } from "./rainbow-kit-theme";

// Create a Wagmi config with RainbowKit
// Note: You'll need to set up a WalletConnect project ID at https://cloud.walletconnect.com
const config = getDefaultConfig({
  appName: "Aster Royale",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo", // Replace with your project ID
  chains: [mainnet, sepolia], // Add Aster chain when available
  ssr: true,
});

// Create a React Query client for Wagmi
const queryClient = new QueryClient();

/**
 * Providers wrapper for RainbowKit + Wagmi
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

