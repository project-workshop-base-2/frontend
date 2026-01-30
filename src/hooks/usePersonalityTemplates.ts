"use client";

import { useState, useEffect, useCallback } from "react";
import { PersonalityConfig } from "@/types/personality";

interface TemplatesState {
  templates: PersonalityConfig[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for fetching and managing personality templates
 */
export function usePersonalityTemplates(
  category?: PersonalityConfig["category"]
) {
  const [state, setState] = useState<TemplatesState>({
    templates: [],
    isLoading: true,
    error: null,
  });

  const [selectedTemplate, setSelectedTemplate] =
    useState<PersonalityConfig | null>(null);

  /**
   * Fetch templates from API
   */
  const fetchTemplates = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (category) {
        params.set("category", category);
      }

      const url = `/api/personality/templates${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch templates");
      }

      setState({
        templates: data.templates,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch templates";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [category]);

  /**
   * Fetch single template by ID
   */
  const fetchTemplateById = useCallback(
    async (id: string): Promise<PersonalityConfig | null> => {
      try {
        const response = await fetch(`/api/personality/templates?id=${id}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Template not found");
        }

        return data.template;
      } catch (error) {
        console.error("Error fetching template:", error);
        return null;
      }
    },
    []
  );

  /**
   * Select a template
   */
  const selectTemplate = useCallback((template: PersonalityConfig | null) => {
    setSelectedTemplate(template);
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  // Fetch templates on mount and when category changes
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates: state.templates,
    isLoading: state.isLoading,
    error: state.error,
    selectedTemplate,
    selectTemplate,
    clearSelection,
    refetch: fetchTemplates,
    fetchTemplateById,
  };
}
