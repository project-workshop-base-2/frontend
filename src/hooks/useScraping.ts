"use client";

import { useState, useCallback } from "react";
import { ScrapedData } from "@/lib/ai-agent";

interface TrendingTopic {
  name: string;
  volume?: number;
  category?: string;
}

interface ScrapingState {
  isLoading: boolean;
  error: string | null;
  data: ScrapedData | null;
}

interface TrendingState {
  isLoading: boolean;
  error: string | null;
  topics: TrendingTopic[];
}

/**
 * Hook for scraping topic data and trending topics
 */
export function useScraping() {
  // Topic scraping state
  const [scrapingState, setScrapingState] = useState<ScrapingState>({
    isLoading: false,
    error: null,
    data: null,
  });

  // Trending topics state
  const [trendingState, setTrendingState] = useState<TrendingState>({
    isLoading: false,
    error: null,
    topics: [],
  });

  /**
   * Scrape data for a specific topic
   */
  const scrapeTopic = useCallback(
    async (topic: string, mode: "full" | "quick" = "quick"): Promise<ScrapedData | null> => {
      setScrapingState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/scraping/topic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, mode }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to scrape topic");
        }

        setScrapingState({
          isLoading: false,
          error: null,
          data: result.data,
        });

        return result.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to scrape topic";
        setScrapingState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    []
  );

  /**
   * Get trending topics
   */
  const fetchTrendingTopics = useCallback(
    async (region: "indonesia" | "worldwide" = "indonesia"): Promise<TrendingTopic[]> => {
      setTrendingState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`/api/scraping/trending?region=${region}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to get trending topics");
        }

        setTrendingState({
          isLoading: false,
          error: null,
          topics: result.topics,
        });

        return result.topics;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get trending topics";
        setTrendingState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return [];
      }
    },
    []
  );

  /**
   * Clear scraped data
   */
  const clearScrapedData = useCallback(() => {
    setScrapingState({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  return {
    // Topic scraping
    scrapedData: scrapingState.data,
    isScrapingTopic: scrapingState.isLoading,
    scrapingError: scrapingState.error,
    scrapeTopic,
    clearScrapedData,

    // Trending topics
    trendingTopics: trendingState.topics,
    isLoadingTrending: trendingState.isLoading,
    trendingError: trendingState.error,
    fetchTrendingTopics,
  };
}
