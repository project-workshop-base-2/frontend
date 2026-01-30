"use client";

import { useState, useCallback } from "react";
import { PersonalityConfig } from "@/types/personality";
import { ScrapedData } from "@/lib/ai-agent";

interface GenerationState {
  isLoading: boolean;
  error: string | null;
}

interface HooksState extends GenerationState {
  hooks: string[];
  reasoning: string | null;
}

interface ContentState extends GenerationState {
  content: string | null;
  hashtags: string[];
  characterCount: number;
  validationErrors: string[];
}

/**
 * Hook for generating content with AI agent
 */
export function useContentGeneration() {
  // Hooks generation state
  const [hooksState, setHooksState] = useState<HooksState>({
    isLoading: false,
    error: null,
    hooks: [],
    reasoning: null,
  });

  // Content generation state
  const [contentState, setContentState] = useState<ContentState>({
    isLoading: false,
    error: null,
    content: null,
    hashtags: [],
    characterCount: 0,
    validationErrors: [],
  });

  /**
   * Generate hooks for a topic
   */
  const generateHooks = useCallback(
    async (
      personality: PersonalityConfig,
      topic: string,
      scrapedData?: ScrapedData
    ): Promise<string[]> => {
      setHooksState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/generate/hooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personality, topic, scrapedData }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to generate hooks");
        }

        setHooksState({
          isLoading: false,
          error: null,
          hooks: data.hooks,
          reasoning: data.reasoning,
        });

        return data.hooks;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to generate hooks";
        setHooksState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Generate full content from selected hook
   */
  const generateContent = useCallback(
    async (
      personality: PersonalityConfig,
      topic: string,
      selectedHook: string,
      scrapedData?: ScrapedData
    ): Promise<string> => {
      setContentState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/generate/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personality, topic, selectedHook, scrapedData }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to generate content");
        }

        setContentState({
          isLoading: false,
          error: null,
          content: data.content,
          hashtags: data.hashtags || [],
          characterCount: data.characterCount || data.content.length,
          validationErrors: data.validationErrors || [],
        });

        return data.content;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to generate content";
        setContentState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setHooksState({
      isLoading: false,
      error: null,
      hooks: [],
      reasoning: null,
    });
    setContentState({
      isLoading: false,
      error: null,
      content: null,
      hashtags: [],
      characterCount: 0,
      validationErrors: [],
    });
  }, []);

  /**
   * Reset only hooks state
   */
  const resetHooks = useCallback(() => {
    setHooksState({
      isLoading: false,
      error: null,
      hooks: [],
      reasoning: null,
    });
  }, []);

  /**
   * Reset only content state
   */
  const resetContent = useCallback(() => {
    setContentState({
      isLoading: false,
      error: null,
      content: null,
      hashtags: [],
      characterCount: 0,
      validationErrors: [],
    });
  }, []);

  return {
    // Hooks generation
    hooks: hooksState.hooks,
    hooksLoading: hooksState.isLoading,
    hooksError: hooksState.error,
    hooksReasoning: hooksState.reasoning,
    generateHooks,
    resetHooks,

    // Content generation
    content: contentState.content,
    contentLoading: contentState.isLoading,
    contentError: contentState.error,
    hashtags: contentState.hashtags,
    characterCount: contentState.characterCount,
    validationErrors: contentState.validationErrors,
    generateContent,
    resetContent,

    // General
    isLoading: hooksState.isLoading || contentState.isLoading,
    reset,
  };
}
