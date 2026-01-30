import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { optimism } from 'viem/chains';

const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

export async function POST(req: NextRequest) {
  try {
    const { message, signature, nonce } = await req.json();

    // Validate required fields
    if (!message || !signature || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, you should:
    // 1. Verify nonce hasn't been used (check database)
    // 2. Verify nonce hasn't expired
    // 3. Store session in database
    // 4. Return session token

    // For now, we'll just verify the signature and return user data
    return NextResponse.json({
      success: true,
      fid: message.fid,
      username: message.username,
      displayName: message.displayName,
      pfpUrl: message.pfpUrl,
      custody: message.custody,
      verifications: message.verifications,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
