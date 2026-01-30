import { NeynarAPIClient } from '@neynar/nodejs-sdk';

// Initialize Neynar client
let neynarClient: NeynarAPIClient | null = null;

export function getNeynarClient(): NeynarAPIClient {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;

    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY is not configured. Get your API key from https://neynar.com');
    }

    neynarClient = new NeynarAPIClient({ apiKey });
  }

  return neynarClient;
}

/**
 * Publish a cast using Neynar managed signer
 *
 * NOTE: This requires Neynar managed signer setup:
 * 1. Go to https://dev.neynar.com
 * 2. Create an app and get a managed signer
 * 3. User needs to authorize the signer
 *
 * For free tier alternative, use publishCastWithExternalSigner()
 */
export async function publishCastWithManagedSigner(signerUuid: string, text: string): Promise<string> {
  const client = getNeynarClient();

  try {
    if (text.length > 320) {
      throw new Error('Cast text must be 320 characters or less');
    }

    const response = await client.publishCast({ signerUuid, text });
    return response.cast.hash;
  } catch (error: any) {
    console.error('Neynar publishCast error:', error);
    throw new Error(error?.message || 'Failed to publish cast with Neynar');
  }
}

/**
 * Publish cast using external signature (FREE alternative)
 *
 * This method allows posting without managed signers by:
 * 1. Getting signed message from client (via Auth Kit)
 * 2. Submitting to Neynar's submit message endpoint
 */
export async function publishCastWithExternalSigner(
  signedMessage: string,
  fid: number
): Promise<string> {
  const apiKey = process.env.NEYNAR_API_KEY;

  if (!apiKey) {
    throw new Error('NEYNAR_API_KEY not configured');
  }

  try {
    // Submit to Neynar's submit message endpoint
    const response = await fetch('https://api.neynar.com/v2/farcaster/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
      },
      body: JSON.stringify({
        message_bytes_hex: signedMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit message to Neynar');
    }

    const data = await response.json();
    return data.hash || 'unknown';
  } catch (error: any) {
    console.error('Neynar external signer error:', error);
    throw new Error(error?.message || 'Failed to publish cast with external signer');
  }
}

/**
 * Check if user has a managed signer with Neynar
 */
export async function getUserManagedSigner(fid: number): Promise<string | null> {
  const client = getNeynarClient();

  try {
    // Check if user has a managed signer
    // This is a placeholder - actual implementation depends on your Neynar app setup

    // For now, return null to indicate no managed signer
    return null;
  } catch (error) {
    console.error('Error checking managed signer:', error);
    return null;
  }
}
