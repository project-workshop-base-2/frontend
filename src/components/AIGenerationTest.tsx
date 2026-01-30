"use client";

import { useState, useEffect } from "react";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { usePersonalityTemplates } from "@/hooks/usePersonalityTemplates";
import { useScraping } from "@/hooks/useScraping";
import { PersonalityConfig } from "@/types/personality";
import { FarcasterPostButton } from "./FarcasterPostButton";

export function AIGenerationTest() {
  const [topic, setTopic] = useState("");
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "topic" | "hooks" | "content">("select");
  const [enableScraping, setEnableScraping] = useState(true);
  const [showTrending, setShowTrending] = useState(false);

  // Personality templates hook
  const {
    templates,
    isLoading: templatesLoading,
    selectedTemplate,
    selectTemplate,
  } = usePersonalityTemplates();

  // Content generation hook
  const {
    hooks,
    hooksLoading,
    hooksError,
    generateHooks,
    content,
    contentLoading,
    contentError,
    characterCount,
    generateContent,
    reset,
  } = useContentGeneration();

  // Scraping hook
  const {
    scrapedData,
    isScrapingTopic,
    scrapingError,
    scrapeTopic,
    clearScrapedData,
    trendingTopics,
    isLoadingTrending,
    fetchTrendingTopics,
  } = useScraping();

  // Fetch trending topics when opening selector
  useEffect(() => {
    if (showTrending && trendingTopics.length === 0) {
      fetchTrendingTopics();
    }
  }, [showTrending, trendingTopics.length, fetchTrendingTopics]);

  // Handle personality selection
  const handleSelectPersonality = (template: PersonalityConfig) => {
    selectTemplate(template);
    setStep("topic");
  };

  // Handle topic submission with optional scraping
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !selectedTemplate) return;

    try {
      let scraped = null;

      // Scrape topic data if enabled
      if (enableScraping) {
        scraped = await scrapeTopic(topic.trim(), "quick");
      }

      // Generate hooks with scraped data
      await generateHooks(selectedTemplate, topic, scraped || undefined);
      setStep("hooks");
    } catch (error) {
      console.error("Failed to generate hooks:", error);
    }
  };

  // Handle trending topic selection
  const handleSelectTrending = (topicName: string) => {
    setTopic(topicName);
    setShowTrending(false);
  };

  // Handle hook selection
  const handleSelectHook = async (hook: string) => {
    setSelectedHook(hook);
    if (!selectedTemplate) return;

    try {
      await generateContent(selectedTemplate, topic, hook, scrapedData || undefined);
      setStep("content");
    } catch (error) {
      console.error("Failed to generate content:", error);
    }
  };

  // Reset everything
  const handleReset = () => {
    reset();
    selectTemplate(null);
    setTopic("");
    setSelectedHook(null);
    setStep("select");
    clearScrapedData();
    setShowTrending(false);
  };

  const isProcessing = hooksLoading || isScrapingTopic;

  return (
    <div className="ai-generation-test">
      <div className="test-header">
        <h2>AI Content Generation</h2>
        <p className="subtitle">Generate personal branding content with AI</p>
      </div>

      {/* Progress indicator */}
      <div className="progress-steps">
        <div className={`step ${step === "select" ? "active" : "completed"}`}>
          1. Personality
        </div>
        <div className={`step ${step === "topic" ? "active" : step === "hooks" || step === "content" ? "completed" : ""}`}>
          2. Topic
        </div>
        <div className={`step ${step === "hooks" ? "active" : step === "content" ? "completed" : ""}`}>
          3. Hook
        </div>
        <div className={`step ${step === "content" ? "active" : ""}`}>
          4. Content
        </div>
      </div>

      {/* Step 1: Select Personality */}
      {step === "select" && (
        <div className="step-content">
          <h3>Select a Personality</h3>
          {templatesLoading ? (
            <p className="loading">Loading templates...</p>
          ) : (
            <div className="personality-grid">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className="personality-card"
                  onClick={() => handleSelectPersonality(template)}
                >
                  <h4>{template.name}</h4>
                  <p className="category">{template.category}</p>
                  <p className="description">
                    {Array.isArray(template.bio) ? template.bio[0] : template.bio}
                  </p>
                  <div className="traits">
                    {template.adjectives.slice(0, 3).map((adj) => (
                      <span key={adj} className="trait">{adj}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Enter Topic */}
      {step === "topic" && selectedTemplate && (
        <div className="step-content">
          <div className="selected-info">
            <span className="label">Selected:</span>
            <span className="value">{selectedTemplate.name}</span>
          </div>

          <form onSubmit={handleTopicSubmit} className="topic-form">
            <h3>Enter a Topic</h3>

            {/* Scraping toggle */}
            <div className="scraping-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={enableScraping}
                  onChange={(e) => setEnableScraping(e.target.checked)}
                  disabled={isProcessing}
                />
                <span className="toggle-text">
                  Enable data scraping for better context
                </span>
              </label>
              <p className="toggle-hint">
                {enableScraping
                  ? "AI will use real-time scraped data for more relevant content"
                  : "AI will generate based on general knowledge only"}
              </p>
            </div>

            {/* Topic input with trending button */}
            <div className="topic-input-group">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI di Indonesia, Tips produktivitas, Crypto market"
                disabled={isProcessing}
              />
              <button
                type="button"
                className="trending-btn"
                onClick={() => setShowTrending(!showTrending)}
                disabled={isProcessing}
              >
                {showTrending ? "Hide" : "Trending"}
              </button>
            </div>

            {/* Trending topics dropdown */}
            {showTrending && (
              <div className="trending-dropdown">
                <p className="trending-title">Trending Topics</p>
                {isLoadingTrending ? (
                  <p className="loading-small">Loading trending topics...</p>
                ) : (
                  <div className="trending-list">
                    {trendingTopics.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        className="trending-item"
                        onClick={() => handleSelectTrending(t.name)}
                      >
                        <span className="trending-name">{t.name}</span>
                        {t.category && (
                          <span className="trending-category">{t.category}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={!topic.trim() || isProcessing}
            >
              {isScrapingTopic
                ? "Scraping data..."
                : hooksLoading
                ? "Generating hooks..."
                : "Generate Hooks"}
            </button>
          </form>

          {/* Scraping status */}
          {isScrapingTopic && (
            <div className="scraping-status">
              <span className="spinner"></span>
              <span>Scraping real-time data for &quot;{topic}&quot;...</span>
            </div>
          )}

          {scrapingError && (
            <p className="warning">{scrapingError} - Continuing without scraped data</p>
          )}
          {hooksError && <p className="error">{hooksError}</p>}
        </div>
      )}

      {/* Step 3: Select Hook */}
      {step === "hooks" && (
        <div className="step-content">
          <div className="selected-info">
            <span className="label">Topic:</span>
            <span className="value">{topic}</span>
            {scrapedData && (
              <span className="scraped-badge">+ scraped context</span>
            )}
          </div>

          {/* Show scraped insights */}
          {scrapedData && scrapedData.insights.length > 0 && (
            <div className="scraped-insights">
              <p className="insights-title">Context from scraping:</p>
              <ul className="insights-list">
                {scrapedData.insights.slice(0, 3).map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
              {scrapedData.trendingKeywords.length > 0 && (
                <div className="keywords">
                  <span className="keywords-label">Keywords:</span>
                  {scrapedData.trendingKeywords.slice(0, 5).map((kw, i) => (
                    <span key={i} className="keyword">{kw}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <h3>Select a Hook</h3>
          <p className="hint">Choose the hook that will start your post</p>
          <div className="hooks-list">
            {hooks.map((hook, index) => (
              <button
                key={index}
                className={`hook-option ${selectedHook === hook ? "selected" : ""}`}
                onClick={() => handleSelectHook(hook)}
                disabled={contentLoading}
              >
                <span className="hook-number">{index + 1}</span>
                <span className="hook-text">{hook}</span>
              </button>
            ))}
          </div>
          {contentLoading && <p className="loading">Generating content...</p>}
          {contentError && <p className="error">{contentError}</p>}
        </div>
      )}

      {/* Step 4: View Content */}
      {step === "content" && content && (
        <div className="step-content">
          <h3>Generated Content</h3>
          <div className="content-preview">
            <div className="content-text">{content}</div>
            <div className="content-meta">
              <span className="char-count">
                {characterCount} / {selectedTemplate?.settings.maxPostLength} characters
              </span>
              {scrapedData && (
                <span className="context-badge">Generated with scraped context</span>
              )}
            </div>
          </div>
          <div className="content-actions">
            <button className="secondary" onClick={handleReset}>
              Start Over
            </button>
            <button
              className="primary"
              onClick={() => navigator.clipboard.writeText(content)}
            >
              Copy to Clipboard
            </button>
          </div>

          {/* Farcaster Posting */}
          <div className="farcaster-section">
            <h4>Post to Farcaster</h4>
            <FarcasterPostButton
              content={content}
              onSuccess={(hash) => {
                console.log("Posted to Farcaster:", hash);
              }}
              onError={(error) => {
                console.error("Farcaster post error:", error);
              }}
            />
          </div>
        </div>
      )}

      {/* Back button for non-first steps */}
      {step !== "select" && step !== "content" && (
        <button className="back-btn" onClick={handleReset}>
          Start Over
        </button>
      )}

      <style jsx>{`
        .ai-generation-test {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .test-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .test-header h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #666;
          font-size: 0.9rem;
        }

        .progress-steps {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .step {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: #f0f0f0;
          font-size: 0.85rem;
          color: #666;
        }

        .step.active {
          background: #0066ff;
          color: white;
        }

        .step.completed {
          background: #00cc66;
          color: white;
        }

        .step-content {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .step-content h3 {
          margin-bottom: 1rem;
        }

        .selected-info {
          background: #f5f5f5;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .selected-info .label {
          color: #666;
        }

        .selected-info .value {
          font-weight: 600;
        }

        .scraped-badge {
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          background: #e0f0ff;
          color: #0066ff;
          border-radius: 10px;
        }

        .personality-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }

        .personality-card {
          text-align: left;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .personality-card:hover {
          border-color: #0066ff;
          transform: translateY(-2px);
        }

        .personality-card h4 {
          margin-bottom: 0.25rem;
        }

        .personality-card .category {
          font-size: 0.75rem;
          color: #0066ff;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .personality-card .description {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .traits {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .trait {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          background: #f0f0f0;
          border-radius: 10px;
        }

        .topic-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .scraping-toggle {
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .toggle-label input {
          width: 18px;
          height: 18px;
        }

        .toggle-text {
          font-weight: 500;
        }

        .toggle-hint {
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.5rem;
          margin-left: 26px;
        }

        .topic-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .topic-input-group input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
        }

        .topic-input-group input:focus {
          outline: none;
          border-color: #0066ff;
        }

        .trending-btn {
          padding: 0.75rem 1rem;
          background: #f0f0f0;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
        }

        .trending-btn:hover {
          background: #e0e0e0;
        }

        .trending-dropdown {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 1rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .trending-title {
          font-weight: 600;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .trending-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .trending-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
        }

        .trending-item:hover {
          background: #f0f0f0;
        }

        .trending-name {
          font-size: 0.9rem;
        }

        .trending-category {
          font-size: 0.7rem;
          color: #666;
          padding: 0.1rem 0.4rem;
          background: #f0f0f0;
          border-radius: 4px;
        }

        .submit-btn {
          padding: 0.75rem 1.5rem;
          background: #0066ff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .scraping-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f0f7ff;
          border-radius: 8px;
          margin-top: 1rem;
          color: #0066ff;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #0066ff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .scraped-insights {
          background: #f0f7ff;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .insights-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0066ff;
          margin-bottom: 0.5rem;
        }

        .insights-list {
          font-size: 0.85rem;
          color: #333;
          margin: 0;
          padding-left: 1.25rem;
        }

        .insights-list li {
          margin-bottom: 0.25rem;
        }

        .keywords {
          margin-top: 0.75rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        }

        .keywords-label {
          font-size: 0.8rem;
          color: #666;
        }

        .keyword {
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          background: white;
          border-radius: 10px;
        }

        .hint {
          color: #666;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .hooks-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .hook-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .hook-option:hover {
          border-color: #0066ff;
        }

        .hook-option.selected {
          border-color: #0066ff;
          background: #f0f7ff;
        }

        .hook-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .hook-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          border-radius: 50%;
          font-weight: 600;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .hook-text {
          flex: 1;
        }

        .content-preview {
          background: #f9f9f9;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .content-text {
          white-space: pre-wrap;
          line-height: 1.6;
          font-size: 1rem;
        }

        .content-meta {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .char-count {
          font-size: 0.85rem;
          color: #666;
        }

        .context-badge {
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          background: #e0f0ff;
          color: #0066ff;
          border-radius: 10px;
        }

        .content-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .content-actions button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
        }

        .content-actions .secondary {
          background: white;
          border: 2px solid #e0e0e0;
          color: #333;
        }

        .content-actions .primary {
          background: #0066ff;
          border: none;
          color: white;
        }

        .back-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .back-btn:hover {
          color: #333;
        }

        .loading {
          color: #0066ff;
          text-align: center;
          padding: 1rem;
        }

        .loading-small {
          color: #666;
          font-size: 0.85rem;
          text-align: center;
          padding: 0.5rem;
        }

        .error {
          color: #cc0000;
          background: #fff0f0;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .warning {
          color: #996600;
          background: #fff8e0;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .farcaster-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
        }

        .farcaster-section h4 {
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #333;
        }
      `}</style>
    </div>
  );
}
