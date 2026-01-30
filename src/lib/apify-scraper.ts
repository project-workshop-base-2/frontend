import { ApifyClient } from "apify-client";

/**
 * Apify Scraping Service
 * Handles data scraping for content generation context
 */

// Types
export interface ScrapedPost {
  content: string;
  engagement: number;
  source: string;
  author?: string;
  url?: string;
  createdAt?: string;
}

export interface ScrapedData {
  topic: string;
  trendingKeywords: string[];
  relevantPosts: ScrapedPost[];
  insights: string[];
  scrapedAt: string;
}

export interface TrendingTopic {
  name: string;
  volume?: number;
  category?: string;
}

// Lazy initialize Apify client
function getApifyClient(): ApifyClient {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN environment variable is not set");
  }
  return new ApifyClient({ token });
}

/**
 * Extract keywords from scraped content
 */
function extractKeywords(posts: ScrapedPost[]): string[] {
  const wordFrequency: Record<string, number> = {};
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "dare", "ought",
    "used", "it", "its", "this", "that", "these", "those", "i", "you", "he",
    "she", "we", "they", "what", "which", "who", "whom", "when", "where", "why",
    "how", "all", "each", "every", "both", "few", "more", "most", "other",
    "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
    "too", "very", "just", "also", "now", "here", "there", "then", "once",
    "yang", "dan", "di", "ke", "dari", "ini", "itu", "dengan", "untuk",
    "pada", "adalah", "juga", "akan", "bisa", "ada", "tidak", "sudah",
    "saya", "kita", "anda", "mereka", "dia", "kami", "nya", "lagi", "lebih",
  ]);

  posts.forEach((post) => {
    const words = post.content
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
  });

  // Sort by frequency and return top keywords
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

/**
 * Generate insights from scraped posts
 */
function generateInsights(posts: ScrapedPost[], topic: string): string[] {
  const insights: string[] = [];

  if (posts.length === 0) {
    return [`No recent posts found about "${topic}"`];
  }

  // Insight 1: Volume
  insights.push(`Found ${posts.length} recent posts about "${topic}"`);

  // Insight 2: Top engagement
  const sortedByEngagement = [...posts].sort((a, b) => b.engagement - a.engagement);
  if (sortedByEngagement[0] && sortedByEngagement[0].engagement > 0) {
    const topPost = sortedByEngagement[0];
    insights.push(
      `Top performing post has ${topPost.engagement.toLocaleString()} engagements`
    );
  }

  // Insight 3: Common themes (from content analysis)
  const allContent = posts.map((p) => p.content).join(" ");
  const contentLower = allContent.toLowerCase();

  // Check for common patterns
  const patterns = [
    { keyword: "ai", label: "AI/Artificial Intelligence is being discussed" },
    { keyword: "crypto", label: "Cryptocurrency mentions are present" },
    { keyword: "startup", label: "Startup ecosystem is a theme" },
    { keyword: "tips", label: "People are sharing tips and advice" },
    { keyword: "thread", label: "Thread-style content is popular" },
    { keyword: "breaking", label: "Breaking news or updates" },
    { keyword: "viral", label: "Viral content trending" },
  ];

  patterns.forEach(({ keyword, label }) => {
    if (contentLower.includes(keyword)) {
      insights.push(label);
    }
  });

  // Insight 4: Sentiment hint
  const positiveWords = ["great", "amazing", "love", "best", "awesome", "bagus", "mantap", "keren"];
  const negativeWords = ["bad", "worst", "hate", "terrible", "awful", "jelek", "buruk"];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (contentLower.includes(word)) positiveCount++;
  });
  negativeWords.forEach((word) => {
    if (contentLower.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) {
    insights.push("Overall sentiment appears positive");
  } else if (negativeCount > positiveCount) {
    insights.push("Overall sentiment appears negative or critical");
  } else {
    insights.push("Sentiment is mixed or neutral");
  }

  return insights.slice(0, 6); // Limit to 6 insights
}

/**
 * Scrape Twitter/X for topic-related posts
 * Uses apidojo/tweet-scraper actor
 */
export async function scrapeTopicData(topic: string): Promise<ScrapedData> {
  const client = getApifyClient();

  try {
    // Run Twitter scraper
    // Using a lightweight scraper that doesn't require Twitter auth
    const run = await client.actor("apidojo/tweet-scraper").call(
      {
        searchTerms: [topic],
        maxTweets: 30,
        sort: "Top",
        tweetLanguage: "id", // Indonesian
      },
      {
        timeout: 60, // 60 second timeout
        memory: 256, // Minimum memory
      }
    );

    // Get results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Transform to our format
    const relevantPosts: ScrapedPost[] = items.slice(0, 20).map((item: Record<string, unknown>) => ({
      content: (item.full_text || item.text || "") as string,
      engagement:
        ((item.favorite_count as number) || 0) +
        ((item.retweet_count as number) || 0) +
        ((item.reply_count as number) || 0),
      source: "twitter",
      author: (item.user as { screen_name?: string })?.screen_name || "unknown",
      url: item.url as string | undefined,
      createdAt: item.created_at as string | undefined,
    }));

    // Extract keywords and generate insights
    const trendingKeywords = extractKeywords(relevantPosts);
    const insights = generateInsights(relevantPosts, topic);

    return {
      topic,
      trendingKeywords,
      relevantPosts,
      insights,
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Apify scraping error:", error);

    // Return empty result with error insight
    return {
      topic,
      trendingKeywords: [],
      relevantPosts: [],
      insights: [
        `Could not scrape data for "${topic}"`,
        "AI will generate content without real-time context",
      ],
      scrapedAt: new Date().toISOString(),
    };
  }
}

/**
 * Get trending topics
 * Uses web scraping for trending topics
 */
export async function getTrendingTopics(
  region: "indonesia" | "worldwide" = "indonesia"
): Promise<TrendingTopic[]> {
  const client = getApifyClient();

  try {
    // Use Google Trends scraper for trending topics
    const run = await client.actor("emastra/google-trends-scraper").call(
      {
        geo: region === "indonesia" ? "ID" : "",
        outputMode: "complete",
        maxItems: 20,
        isPublic: true,
      },
      {
        timeout: 60,
        memory: 256,
      }
    );

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Transform to our format
    const topics: TrendingTopic[] = items.slice(0, 15).map((item: Record<string, unknown>) => ({
      name: (item.title || item.query || item.term || "Unknown") as string,
      volume: (item.formattedTraffic || item.value) as number | undefined,
      category: (item.category || "general") as string,
    }));

    return topics;
  } catch (error) {
    console.error("Trending topics error:", error);

    // Return fallback trending topics
    return [
      { name: "AI Indonesia", category: "technology" },
      { name: "Startup Lokal", category: "business" },
      { name: "Crypto Market", category: "finance" },
      { name: "Tech News", category: "technology" },
      { name: "Digital Marketing", category: "business" },
    ];
  }
}

/**
 * Quick scrape - lighter version for faster results
 * Uses web search instead of social media scraping
 */
export async function quickScrape(topic: string): Promise<ScrapedData> {
  const client = getApifyClient();

  try {
    // Use Google Search scraper for quick results
    const run = await client.actor("apify/google-search-scraper").call(
      {
        queries: `${topic} site:twitter.com OR site:linkedin.com`,
        maxPagesPerQuery: 1,
        resultsPerPage: 10,
        languageCode: "id",
        countryCode: "id",
      },
      {
        timeout: 30,
        memory: 256,
      }
    );

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Transform search results to posts format
    const relevantPosts: ScrapedPost[] = items.slice(0, 10).map((item: Record<string, unknown>) => ({
      content: `${item.title || ""} - ${item.description || ""}`,
      engagement: 0, // Search results don't have engagement
      source: "web_search",
      url: item.url as string | undefined,
    }));

    const trendingKeywords = extractKeywords(relevantPosts);
    const insights = [
      `Found ${relevantPosts.length} relevant web results for "${topic}"`,
      "Content based on recent web mentions",
    ];

    return {
      topic,
      trendingKeywords,
      relevantPosts,
      insights,
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Quick scrape error:", error);

    return {
      topic,
      trendingKeywords: [],
      relevantPosts: [],
      insights: [`Scraping skipped for "${topic}"`],
      scrapedAt: new Date().toISOString(),
    };
  }
}
