"use client";

/**
 * Leaderboard Hook
 * Fetches and manages leaderboard data
 * TODO: Implement with actual data fetching
 */

import { useState, useEffect } from "react";
import type { LeaderboardEntry } from "@/types";

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // TODO: Fetch actual data from Aster API
        // Mock data for now
        const mockData: LeaderboardEntry[] = [];
        setLeaderboard(mockData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    isLoading,
    error,
  };
}

