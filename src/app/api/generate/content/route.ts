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
import { getSupabaseServerClient } from "@/lib/supabase";
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { PAYMENT_GATEWAY_ADDRESS } from '@/contract';
import PAYMENT_GATEWAY_ABI from '@/abi/x402.json';

// Lazy initialize Groq client
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  return new Groq({ apiKey });
}

// Initialize blockchain clients
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
});

function getWalletClient() {
  const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("BACKEND_WALLET_PRIVATE_KEY environment variable is not set");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
  });
}

// Check user's credit balance on-chain
async function checkCreditBalance(userAddress: string): Promise<number> {
  try {
    const balance = await publicClient.readContract({
      address: PAYMENT_GATEWAY_ADDRESS as `0x${string}`,
      abi: PAYMENT_GATEWAY_ABI,
      functionName: 'creditBalance',
      args: [userAddress as `0x${string}`],
    });

    return Number(balance);
  } catch (error) {
    console.error('Failed to check credit balance:', error);
    throw new Error('Failed to verify credit balance from blockchain');
  }
}

// Deduct credits on-chain using useCreditsFor
async function deductCredits(userAddress: string, amount: number, reason: string): Promise<string> {
  try {
    const walletClient = getWalletClient();

    const hash = await walletClient.writeContract({
      address: PAYMENT_GATEWAY_ADDRESS as `0x${string}`,
      abi: PAYMENT_GATEWAY_ABI,
      functionName: 'useCreditsFor',
      args: [userAddress as `0x${string}`, BigInt(amount), reason],
    });

    // Wait for transaction to be mined
    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    console.error('Failed to deduct credits on-chain:', error);
    throw new Error('Failed to deduct credits from blockchain');
  }
}

export interface ContentRequestBody {
  personality: PersonalityConfig;
  topic: string;
  selectedHook: string;
  scrapedData?: ScrapedData;
  userAddress: string;
}

export interface ContentResponseBody {
  success: boolean;
  content?: string;
  hashtags?: string[];
  characterCount?: number;
  contentId?: string;
  error?: string;
  validationErrors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse<ContentResponseBody>> {
  try {
    // Parse request body
    const body: ContentRequestBody = await request.json();
    const { personality, topic, selectedHook, scrapedData, userAddress } = body;

    // Validate required fields
    if (!personality || !topic || !selectedHook || !userAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: personality, topic, selectedHook, and userAddress",
        },
        { status: 400 }
      );
    }

    // ===== CRITICAL: Check credit balance from blockchain =====
    const creditBalance = await checkCreditBalance(userAddress);
    if (creditBalance < 1) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient credits. You have ${creditBalance} credits but need 1 credit to generate content. Please buy credits first.`,
        },
        { status: 402 } // Payment Required
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

    let finalContent = result.content;
    let finalHashtags = result.hashtags;
    let validationErrors: string[] | undefined;

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
          finalContent = retryResult.content;
          finalHashtags = retryResult.hashtags;
        }
      } else {
        validationErrors = validation.errors;
      }
    }

    // ===== CRITICAL: Deduct credits on-chain BEFORE returning content =====
    let txHash: string | undefined;
    try {
      txHash = await deductCredits(userAddress, 1, 'AI_CONTENT_GENERATION');
      console.log(`✅ Credits deducted on-chain. TX Hash: ${txHash}`);
    } catch (creditError) {
      console.error('Failed to deduct credits on-chain:', creditError);
      return NextResponse.json(
        {
          success: false,
          error: 'Content generated but failed to deduct credits from blockchain. Please try again.',
        },
        { status: 500 }
      );
    }

    // Save to Supabase (with transaction hash for verification)
    let contentId: string | undefined;
    try {
      const supabaseServer = getSupabaseServerClient();

      const { data: savedContent, error: dbError } = await supabaseServer
        .from('content_history')
        .insert({
          user_address: userAddress,
          topic: topic,
          selected_hook: selectedHook,
          generated_content: finalContent,
          credits_used: 1,
          status: 'generated',
          cast_hash: txHash, // Store blockchain TX hash for verification
        })
        .select()
        .single();

      if (dbError) {
        console.error('Failed to save to database:', dbError);
        // Don't fail request - user still gets content and credits already deducted
      } else {
        contentId = savedContent?.id;
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue - user still gets content even if DB save fails
    }

    return NextResponse.json({
      success: true,
      content: finalContent,
      hashtags: finalHashtags,
      characterCount: finalContent.length,
      contentId,
      validationErrors,
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
