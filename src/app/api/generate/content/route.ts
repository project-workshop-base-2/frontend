import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  buildSystemPrompt,
  buildContentGenerationPrompt,
  parseContentResponse,
  validateContent,
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

export interface ContentRequestBody {
  personality: PersonalityConfig;
  topic: string;
  selectedHook: string;
  scrapedData?: ScrapedData;
}

export interface ContentResponseBody {
  success: boolean;
  content?: string;
  hashtags?: string[];
  characterCount?: number;
  error?: string;
  validationErrors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse<ContentResponseBody>> {
  try {
    // Parse request body
    const body: ContentRequestBody = await request.json();
    const { personality, topic, selectedHook, scrapedData } = body;

    // Validate required fields
    if (!personality || !topic || !selectedHook) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: personality, topic, and selectedHook",
        },
        { status: 400 }
      );
    }

    // Build prompts
    const systemPrompt = buildSystemPrompt(personality);
    const userPrompt = buildContentGenerationPrompt(
      topic,
      selectedHook,
      personality,
      scrapedData
    );

    // Call Groq
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Fast and capable model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json(
        { success: false, error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse response
    const result = parseContentResponse(responseText);

    // Validate content
    const validation = validateContent(
      result.content,
      personality.settings.maxPostLength
    );

    if (!validation.valid) {
      // Try to regenerate with stricter instructions if too long
      if (result.content.length > personality.settings.maxPostLength) {
        const retryPrompt = `${userPrompt}\n\nIMPORTANT: Your previous response was ${result.content.length} characters. You MUST stay under ${personality.settings.maxPostLength} characters. Be more concise.`;

        const retryCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: retryPrompt },
          ],
          temperature: 0.6,
          max_tokens: 1200,
        });

        const retryText = retryCompletion.choices[0]?.message?.content;
        if (retryText) {
          const retryResult = parseContentResponse(retryText);
          return NextResponse.json({
            success: true,
            content: retryResult.content,
            hashtags: retryResult.hashtags,
            characterCount: retryResult.content.length,
          });
        }
      }

      // Return with validation errors
      return NextResponse.json({
        success: true,
        content: result.content,
        hashtags: result.hashtags,
        characterCount: result.content.length,
        validationErrors: validation.errors,
      });
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      hashtags: result.hashtags,
      characterCount: result.content.length,
    });
  } catch (error) {
    console.error("Content generation error:", error);

    // Handle Groq specific errors
    if (error instanceof Groq.APIError) {
      return NextResponse.json(
        { success: false, error: `Groq API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
