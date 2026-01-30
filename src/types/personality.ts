/**
 * Personality Configuration Types
 * Inspired by ElizaOS character system
 */

export interface MessageExample {
  role: "user" | "assistant";
  content: string;
}

export interface PersonalityStyle {
  /** Universal style rules applied to all outputs */
  all: string[];
  /** Chat-specific style rules */
  chat: string[];
  /** Social media post style rules (for Farcaster) */
  post: string[];
}

export interface PersonalitySettings {
  /** Overall tone of communication */
  tone: "formal" | "casual" | "humorous" | "inspirational" | "educational";
  /** Primary language code */
  language: "id" | "en";
  /** Maximum character limit for posts */
  maxPostLength: number;
  /** How to use hashtags */
  hashtagStyle: "none" | "minimal" | "moderate";
  /** How to use emojis */
  emojiUsage: "none" | "minimal" | "moderate" | "heavy";
}

export interface PersonalityConfig {
  /** Unique identifier */
  id: string;
  /** Display name for the personality */
  name: string;
  /** Background/personality description - can be string or array for variation */
  bio: string | string[];
  /** Social media username style */
  username?: string;
  /** Personality trait keywords */
  adjectives: string[];
  /** Writing style guidelines */
  style: PersonalityStyle;
  /** Areas of expertise/interest */
  topics: string[];
  /** Domain knowledge and facts */
  knowledge: string[];
  /** Backstory elements (indirect personality hints) */
  lore: string[];
  /** Sample conversations for AI training */
  messageExamples: MessageExample[][];
  /** Sample social media posts */
  postExamples: string[];
  /** Behavioral settings */
  settings: PersonalitySettings;
  /** Whether this is a pre-built template */
  isTemplate: boolean;
  /** Template category for filtering */
  category?: "tech" | "crypto" | "business" | "creative" | "custom";
}

/** Minimal personality for creation/editing */
export interface PersonalityInput {
  name: string;
  bio: string | string[];
  username?: string;
  adjectives: string[];
  style: PersonalityStyle;
  topics: string[];
  knowledge?: string[];
  lore?: string[];
  messageExamples?: MessageExample[][];
  postExamples?: string[];
  settings?: Partial<PersonalitySettings>;
}

/** Default settings for new personalities */
export const DEFAULT_PERSONALITY_SETTINGS: PersonalitySettings = {
  tone: "casual",
  language: "id",
  maxPostLength: 600,
  hashtagStyle: "minimal",
  emojiUsage: "minimal",
};

/** Generate unique ID for personality */
export function generatePersonalityId(): string {
  return `personality_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/** Create full personality from input */
export function createPersonality(input: PersonalityInput): PersonalityConfig {
  return {
    id: generatePersonalityId(),
    name: input.name,
    bio: input.bio,
    username: input.username,
    adjectives: input.adjectives,
    style: input.style,
    topics: input.topics,
    knowledge: input.knowledge || [],
    lore: input.lore || [],
    messageExamples: input.messageExamples || [],
    postExamples: input.postExamples || [],
    settings: {
      ...DEFAULT_PERSONALITY_SETTINGS,
      ...input.settings,
    },
    isTemplate: false,
    category: "custom",
  };
}
