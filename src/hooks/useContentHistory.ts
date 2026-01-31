"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";

interface ContentHistoryItem {
  id: string;
  user_address: string;
  topic: string;
  selected_hook: string;
  generated_content: string;
  cast_hash: string | null;
  status: 'generated' | 'posted' | 'failed';
  created_at: string;
  credits_used: number;
}

export function useContentHistory() {
  const { address } = useAccount();
  const [history, setHistory] = useState<ContentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(
    async (offset = 0, limit = 10) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          userAddress: address,
          limit: limit.toString(),
          offset: offset.toString(),
        });

        const response = await fetch(`/api/content/history?${params}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch history');
        }

        setHistory(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
        setError(errorMessage);
        console.error('Content history error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [address]
  );

  const refreshHistory = useCallback(() => {
    return fetchHistory(0, 10);
  }, [fetchHistory]);

  useEffect(() => {
    if (address) {
      fetchHistory();
    }
  }, [address, fetchHistory]);

  return {
    history,
    isLoading,
    error,
    total,
    fetchHistory,
    refreshHistory,
  };
}
