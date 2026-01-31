"use client";

import { useState } from "react";
import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useAccount } from 'wagmi';

interface FarcasterPostButtonProps {
  content: string;
  contentId?: string;
  onSuccess?: (hash: string) => void;
  onError?: (error: string) => void;
}

export function FarcasterPostButton({
  content,
  contentId,
  onSuccess,
  onError,
}: FarcasterPostButtonProps) {
  const { composeCast } = useComposeCast();
  const { context } = useMiniKit();
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Check if we're in Mini App context
  const isInMiniApp = !!context;

  // Generate Warpcast compose URL with pre-filled content (fallback)
  const getWarpcastUrl = () => {
    const encodedText = encodeURIComponent(content.trim());
    return `https://warpcast.com/~/compose?text=${encodedText}`;
  };

  // Handle posting via Mini App SDK or fallback to Warpcast
  const handlePostToFarcaster = async () => {
    setIsPosting(true);
    setError(null);

    try {
      if (!isInMiniApp) {
        // Fallback: open Warpcast if not in Mini App
        const url = getWarpcastUrl();
        window.open(url, '_blank', 'noopener,noreferrer');

        // Update database status to "posted" (optimistic)
        if (contentId) {
          await fetch('/api/content/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contentId,
              status: 'posted',
            }),
          });
        }

        onSuccess?.('shared');
      } else {
        // Use the MiniKit composeCast hook for direct posting
        composeCast({
          text: content.trim(),
          embeds: [window.location.origin] // Add app URL as embed
        });

        // Update database status to "posted"
        if (contentId) {
          await fetch('/api/content/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contentId,
              status: 'posted',
            }),
          });
        }

        onSuccess?.('cast-composed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compose cast';
      setError(errorMessage);
      onError?.(errorMessage);

      // Mark as failed if posting fails
      if (contentId) {
        try {
          await fetch('/api/content/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contentId,
              status: 'failed',
            }),
          });
        } catch (updateErr) {
          console.error('Failed to update failure status:', updateErr);
        }
      }
    } finally {
      setIsPosting(false);
      if (error) {
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Handle Copy Content
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Not connected - show connect wallet message
  if (!isConnected) {
    return (
      <div className="farcaster-post">
        <div className="fc-error">Connect your wallet to share content</div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  // Connected - show share options
  return (
    <div className="farcaster-post">
      {error && <div className="fc-error">{error}</div>}

      <div className="fc-actions">
        <button
          className="fc-btn primary"
          onClick={handlePostToFarcaster}
          disabled={!content || isPosting}
          title={isInMiniApp ? "Post directly to Farcaster" : "Opens Warpcast with your content pre-filled"}
        >
          <FarcasterIcon />
          {isPosting
            ? 'Posting...'
            : (isInMiniApp ? 'Post to Farcaster' : 'Share to Warpcast')
          }
        </button>

        <button
          className="fc-btn secondary"
          onClick={handleCopyContent}
          disabled={!content || isPosting}
          title="Copy content to clipboard"
        >
          {copied ? (
            <>
              <CheckIcon />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon />
              Copy Text
            </>
          )}
        </button>
      </div>

      <p className="fc-hint">
        {isInMiniApp
          ? '✨ Using OnchainKit MiniKit - Direct posting to Farcaster'
          : 'Opens Warpcast with your content ready to post'}
      </p>

      <style jsx>{styles}</style>
    </div>
  );
}

// Farcaster icon component
function FarcasterIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 1000 1000"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z" />
      <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
      <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" />
    </svg>
  );
}

// Copy icon
function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

// Check icon
function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

const styles = `
  .farcaster-post {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: #f8f3ff;
    border-radius: 12px;
    border: 1px solid #e0d4f7;
  }

  .fc-user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
  }

  .fc-user-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .fc-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .fc-username {
    font-weight: 600;
    color: #8a63d2;
  }

  .fc-actions {
    display: flex;
    gap: 0.5rem;
  }

  .fc-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
  }

  .fc-btn.primary {
    background: linear-gradient(135deg, #8a63d2 0%, #7c3aed 100%);
    color: white;
  }

  .fc-btn.primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #7a53c2 0%, #6b2fd6 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }

  .fc-btn.secondary {
    background: rgba(255, 255, 255, 0.8);
    color: #8a63d2;
    border: 1px solid #e0d4f7;
  }

  .fc-btn.secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
  }

  .fc-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .fc-hint {
    font-size: 0.8rem;
    color: #666;
    text-align: center;
    margin-top: -0.25rem;
  }

  .fc-error {
    padding: 0.75rem;
    background: #ffe0e0;
    border-radius: 8px;
    color: #cc0000;
    font-size: 0.9rem;
  }
`;
