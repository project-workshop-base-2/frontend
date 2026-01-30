import { PersonalityConfig } from "@/types/personality";

/**
 * AI Agent Service for Content Generation
 * Handles system prompt building, hook generation, and content generation
 */

// Types for generation
export interface GenerationContext {
  personality: PersonalityConfig;
  topic: string;
  scrapedData?: ScrapedData;
}

export interface ScrapedData {
  topic: string;
  trendingKeywords: string[];
  relevantPosts: {
    content: string;
    engagement: number;
    source: string;
  }[];
  insights: string[];
}

export interface HookGenerationResult {
  hooks: string[];
  reasoning: string;
}

export interface ContentGenerationResult {
  content: string;
  hashtags: string[];
  characterCount: number;
}

/**
 * Build system prompt from personality config
 * This is the core of how the AI "becomes" the personality
 */
export function buildSystemPrompt(personality: PersonalityConfig): string {
  const bioText = Array.isArray(personality.bio)
    ? personality.bio.join("\n")
    : personality.bio;

  const sections = [
    `# Identity`,
    `You are ${personality.name}, a personal branding content creator.`,
    ``,
    `## Bio`,
    bioText,
    ``,
    `## Personality Traits`,
    personality.adjectives.map((adj) => `- ${adj}`).join("\n"),
    ``,
    `## Areas of Expertise`,
    personality.topics.map((topic) => `- ${topic}`).join("\n"),
  ];

  // Add knowledge if exists
  if (personality.knowledge.length > 0) {
    sections.push(
      ``,
      `## Domain Knowledge`,
      personality.knowledge.map((k) => `- ${k}`).join("\n")
    );
  }

  // Add lore/backstory if exists
  if (personality.lore.length > 0) {
    sections.push(
      ``,
      `## Background (use indirectly, don't reveal directly)`,
      personality.lore.map((l) => `- ${l}`).join("\n")
    );
  }

  // Add style guidelines
  sections.push(
    ``,
    `## Writing Style Guidelines`,
    `### General Rules`,
    personality.style.all.map((rule) => `- ${rule}`).join("\n"),
    ``,
    `### For Social Media Posts`,
    personality.style.post.map((rule) => `- ${rule}`).join("\n")
  );

  // Add post examples if exists
  if (personality.postExamples.length > 0) {
    sections.push(
      ``,
      `## Example Posts (match this style)`,
      personality.postExamples.map((ex, i) => `Example ${i + 1}:\n"${ex}"`).join("\n\n")
    );
  }

  // Add settings
  sections.push(
    ``,
    `## Content Settings`,
    `- Tone: ${personality.settings.tone}`,
    `- Language: ${personality.settings.language === "id" ? "Indonesian" : "English"}`,
    `- Maximum post length: ${personality.settings.maxPostLength} characters`,
    `- Hashtag usage: ${personality.settings.hashtagStyle}`,
    `- Emoji usage: ${personality.settings.emojiUsage}`
  );

  return sections.join("\n");
}

/**
 * Build prompt for hook generation
 */
export function buildHookGenerationPrompt(
  topic: string,
  scrapedData?: ScrapedData
): string {
  let prompt = `Generate 5 different hook options for a Farcaster post about "${topic}".

## Requirements for each hook:
1. Be attention-grabbing and match my personality style
2. Maximum 60 characters
3. Create curiosity or provide immediate value
4. Make people want to read more
5. Each hook should have a different angle/approach

## Hook Types to Include:
- Question hook (ask a provocative question)
- Statement hook (bold claim or observation)
- Story hook (start a mini narrative)
- Data hook (interesting stat or fact)
- Contrarian hook (challenge common belief)
`;

  // Add scraped data context if available
  if (scrapedData && scrapedData.insights.length > 0) {
    prompt += `
## Current Trends & Context (use for relevance):
${scrapedData.insights.slice(0, 5).map((insight) => `- ${insight}`).join("\n")}

## Trending Keywords:
${scrapedData.trendingKeywords.slice(0, 10).join(", ")}
`;
  }

  prompt += `
## Output Format:
Return ONLY a valid JSON object with this structure:
{
  "hooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "reasoning": "Brief explanation of why these hooks would work"
}

Do not include any text outside the JSON object.`;

  return prompt;
}

/**
 * Build prompt for full content generation
 */
export function buildContentGenerationPrompt(
  topic: string,
  selectedHook: string,
  personality: PersonalityConfig,
  scrapedData?: ScrapedData
): string {
  let prompt = `Create a comprehensive Farcaster post about "${topic}".

## MUST START WITH THIS HOOK:
"${selectedHook}"

## Content Structure (IMPORTANT - follow this structure):
1. **Opening Hook** (line 1): Use the hook provided above
2. **Context/Problem** (1-2 lines): Explain why this matters or set up the situation
3. **Main Points** (3-5 bullet points or numbered list): Provide detailed insights, tips, or observations
4. **Conclusion/CTA** (1 line): End with a thought-provoking question, call-to-action, or key takeaway

## Requirements:
1. Continue naturally from the hook - expand it into a full, valuable post
2. Match my personality and style EXACTLY
3. AIM for ${Math.floor(personality.settings.maxPostLength * 0.8)}-${personality.settings.maxPostLength} characters (use the space!)
4. Be DETAILED - don't just give surface-level content
5. Include specific examples, numbers, or actionable advice when relevant
6. Use line breaks to improve readability
7. Make it shareable and engaging
`;

  // Add hashtag instructions based on settings
  if (personality.settings.hashtagStyle === "none") {
    prompt += `8. Do NOT use any hashtags\n`;
  } else if (personality.settings.hashtagStyle === "minimal") {
    prompt += `8. Include 1-2 relevant hashtags at the end\n`;
  } else {
    prompt += `8. Include 2-3 relevant hashtags at the end\n`;
  }

  // Add emoji instructions
  if (personality.settings.emojiUsage === "none") {
    prompt += `9. Do NOT use emojis\n`;
  } else if (personality.settings.emojiUsage === "minimal") {
    prompt += `9. Use emojis sparingly (1-3 maximum) to highlight key points\n`;
  } else if (personality.settings.emojiUsage === "moderate") {
    prompt += `9. Use emojis moderately to enhance readability and engagement\n`;
  } else {
    prompt += `9. Use emojis freely to make the post expressive and fun\n`;
  }

  // Add scraped data context
  if (scrapedData && scrapedData.insights.length > 0) {
    prompt += `
## Current Context & Trends (incorporate naturally):
${scrapedData.insights.slice(0, 5).map((insight) => `- ${insight}`).join("\n")}

## Trending Keywords to Consider:
${scrapedData.trendingKeywords.slice(0, 8).join(", ")}
`;
  }

  prompt += `
## IMPORTANT REMINDERS:
- DO NOT be brief or superficial - provide REAL VALUE
- Use the full character limit available (aim for ${Math.floor(personality.settings.maxPostLength * 0.8)}+ characters)
- Include specific details, examples, or data points
- Structure with line breaks for readability

## Output Format:
Return ONLY a valid JSON object with this structure:
{
  "content": "The complete post text with line breaks (use \\n for new lines)",
  "hashtags": ["hashtag1", "hashtag2"],
  "characterCount": 123
}

Do not include any text outside the JSON object.`;

  return prompt;
}

/**
 * Parse hook generation response
 */
export function parseHookResponse(response: string): HookGenerationResult {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed.hooks) || parsed.hooks.length === 0) {
      throw new Error("Invalid hooks array");
    }

    return {
      hooks: parsed.hooks.slice(0, 5),
      reasoning: parsed.reasoning || "",
    };
  } catch (error) {
    console.error("Failed to parse hook response:", error);
    // Return fallback
    return {
      hooks: ["Failed to generate hooks. Please try again."],
      reasoning: "Parse error",
    };
  }
}

/**
 * Parse content generation response
 */
export function parseContentResponse(response: string): ContentGenerationResult {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.content) {
      throw new Error("No content in response");
    }

    return {
      content: parsed.content,
      hashtags: parsed.hashtags || [],
      characterCount: parsed.characterCount || parsed.content.length,
    };
  } catch (error) {
    console.error("Failed to parse content response:", error);
    // Return fallback
    return {
      content: "Failed to generate content. Please try again.",
      hashtags: [],
      characterCount: 0,
    };
  }
}

/**
 * Validate generated content
 */
export function validateContent(
  content: string,
  maxLength: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (content.length > maxLength) {
    errors.push(`Content exceeds maximum length (${content.length}/${maxLength})`);
  }

  if (content.length < 10) {
    errors.push("Content is too short");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
