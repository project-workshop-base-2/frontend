import { NextRequest, NextResponse } from 'next/server';
import { getNeynarClient } from '@/lib/neynar-client';

export async function POST(req: NextRequest) {
  try {
    const { text, fid } = await req.json();

    // Validate input
    if (!text || !fid) {
      return NextResponse.json(
        { error: 'Missing required fields (text, fid)' },
        { status: 400 }
      );
    }

    if (text.length > 320) {
      return NextResponse.json(
        { error: 'Cast text must be 320 characters or less' },
        { status: 400 }
      );
    }

    // Check if Neynar is configured
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    const signerUuid = process.env.NEYNAR_SIGNER_UUID;

    if (!neynarApiKey || neynarApiKey === 'your_neynar_api_key_here') {
      return NextResponse.json(
        {
          error: 'Neynar API not configured',
          info: 'Please add NEYNAR_API_KEY to .env.local. Get your API key at https://neynar.com'
        },
        { status: 503 }
      );
    }

    if (!signerUuid) {
      return NextResponse.json(
        {
          error: 'Neynar signer not configured',
          info: 'Please add NEYNAR_SIGNER_UUID to .env.local. Create a managed signer at https://dev.neynar.com'
        },
        { status: 503 }
      );
    }

    // Post cast via Neynar
    const client = getNeynarClient();

    try {
      const response = await client.publishCast({
        signerUuid,
        text,
      });

      return NextResponse.json({
        success: true,
        hash: response.cast.hash,
        castUrl: `https://warpcast.com/~/conversations/${response.cast.hash}`,
      });
    } catch (neynarError: any) {
      console.error('Neynar API error:', neynarError);

      // Handle specific Neynar errors
      if (neynarError?.message?.includes('signer')) {
        return NextResponse.json(
          {
            error: 'Invalid signer',
            info: 'The NEYNAR_SIGNER_UUID may be invalid or expired. Please check your Neynar dashboard.'
          },
          { status: 401 }
        );
      }

      throw neynarError;
    }

  } catch (error) {
    console.error('Cast submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit cast';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
