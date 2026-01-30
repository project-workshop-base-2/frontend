import { NextRequest, NextResponse } from "next/server";
import { getTrendingTopics, type TrendingTopic } from "@/lib/apify-scraper";

export interface TrendingResponseBody {
  success: boolean;
  topics?: TrendingTopic[];
  error?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<TrendingResponseBody>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get("region") as "indonesia" | "worldwide" | null;

    // Check if Apify token is configured
    if (!process.env.APIFY_API_TOKEN) {
      // Return fallback topics if no token
      return NextResponse.json({
        success: true,
        topics: [
          { name: "AI dan Machine Learning", category: "technology" },
          { name: "Startup Indonesia", category: "business" },
          { name: "Web3 dan Crypto", category: "technology" },
          { name: "Personal Branding", category: "career" },
          { name: "Produktivitas Kerja", category: "lifestyle" },
          { name: "Digital Marketing", category: "business" },
          { name: "Tips Karir", category: "career" },
          { name: "Investasi Pemula", category: "finance" },
          { name: "Tech Industry News", category: "technology" },
          { name: "Entrepreneurship", category: "business" },
        ],
      });
    }

    const topics = await getTrendingTopics(region || "indonesia");

    return NextResponse.json({
      success: true,
      topics,
    });
  } catch (error) {
    console.error("Trending topics error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get trending topics",
      },
      { status: 500 }
    );
  }
}
