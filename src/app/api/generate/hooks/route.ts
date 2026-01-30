import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  buildSystemPrompt,
  buildHookGenerationPrompt,
  parseHookResponse,
  type ScrapedData,
} from "@/lib/ai-agent";
import { PersonalityConfig } from "@/types/personality";

// Lazy initialize Groq client
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  return new Groq({ apiKey });
}

export interface HooksRequestBody {
  personality: PersonalityConfig;
  topic: string;
  scrapedData?: ScrapedData;
}

export interface HooksResponseBody {
  success: boolean;
  hooks?: string[];
  reasoning?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<HooksResponseBody>> {
  try {
    // Parse request body
    const body: HooksRequestBody = await request.json();
    const { personality, topic, scrapedData } = body;

    // Validate required fields
    if (!personality || !topic) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: personality and topic" },
        { status: 400 }
      );
    }

    // Build prompts
    const systemPrompt = buildSystemPrompt(personality);
    const userPrompt = buildHookGenerationPrompt(topic, scrapedData);

    // Call Groq
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Fast and capable model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8, // Higher temperature for creative variation
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json(
        { success: false, error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse response
    const result = parseHookResponse(responseText);

    return NextResponse.json({
      success: true,
      hooks: result.hooks,
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error("Hook generation error:", error);

    // Handle Groq specific errors
    if (error instanceof Groq.APIError) {
      return NextResponse.json(
        { success: false, error: `Groq API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate hooks" },
      { status: 500 }
    );
  }
}
