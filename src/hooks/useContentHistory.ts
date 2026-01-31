"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  const mountedRef = useRef(true);

  const fetchHistory = useCallback(
    async (offset = 0, limit = 10) => {
      if (!address) {
        if (mountedRef.current) setError('Wallet not connected');
        return;
      }

      if (mountedRef.current) {
        setIsLoading(true);
        setError(null);
      }

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

        if (mountedRef.current) {
          setHistory(data.data || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
        if (mountedRef.current) setError(errorMessage);
        console.error('Content history error:', err);
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [address]
  );

  const refreshHistory = useCallback(() => {
    return fetchHistory(0, 10);
  }, [fetchHistory]);

  useEffect(() => {
    mountedRef.current = true;

    if (address) {
      fetchHistory();
    }

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]); // Only re-run when address changes, fetchHistory is stable via useCallback

  return {
    history,
    isLoading,
    error,
    total,
    fetchHistory,
    refreshHistory,
  };
}
