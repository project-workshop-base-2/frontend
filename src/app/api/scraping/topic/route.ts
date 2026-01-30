import { NextRequest, NextResponse } from "next/server";
import { scrapeTopicData, quickScrape, type ScrapedData } from "@/lib/apify-scraper";

export interface ScrapeTopicRequestBody {
  topic: string;
  mode?: "full" | "quick";
}

export interface ScrapeTopicResponseBody {
  success: boolean;
  data?: ScrapedData;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ScrapeTopicResponseBody>> {
  try {
    const body: ScrapeTopicRequestBody = await request.json();
    const { topic, mode = "quick" } = body;

    // Validate
    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    // Check if Apify token is configured
    if (!process.env.APIFY_API_TOKEN) {
      // Return mock data if no token
      return NextResponse.json({
        success: true,
        data: {
          topic,
          trendingKeywords: ["ai", "technology", "startup", "indonesia", "digital"],
          relevantPosts: [],
          insights: [
            "Apify not configured - using AI without scraped context",
            `Topic "${topic}" will be processed with general knowledge`,
          ],
          scrapedAt: new Date().toISOString(),
        },
      });
    }

    // Scrape based on mode
    const data = mode === "full"
      ? await scrapeTopicData(topic.trim())
      : await quickScrape(topic.trim());

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Scraping error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to scrape topic",
      },
      { status: 500 }
    );
  }
}
