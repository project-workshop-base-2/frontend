"use client";

import { useState, useCallback, useMemo } from "react";
import { usePrivy, useFarcasterSigner } from "@privy-io/react-auth";
import { ExternalEd25519Signer, HubRestAPIClient } from "@standard-crypto/farcaster-js";

// Farcaster Hub URL
const FARCASTER_HUB_URL = "https://hub.farcaster.standardcrypto.vc:2281";

export interface FarcasterAccount {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  signerPublicKey?: string;
}

export interface CastResult {
  success: boolean;
  hash?: string;
  error?: string;
}

interface FarcasterState {
  isPosting: boolean;
  error: string | null;
  lastCastHash: string | null;
}

/**
 * Hook for posting to Farcaster via Privy
 */
export function useFarcasterPost() {
  const { user, authenticated, login, logout } = usePrivy();
  const {
    requestFarcasterSignerFromWarpcast,
    getFarcasterSignerPublicKey,
    signFarcasterMessage,
  } = useFarcasterSigner();

  const [state, setState] = useState<FarcasterState>({
    isPosting: false,
    error: null,
    lastCastHash: null,
  });

  // Extract Farcaster account from user
  const farcasterAccount = useMemo((): FarcasterAccount | null => {
    if (!user) return null;

    const fcAccount = user.linkedAccounts?.find(
      (account) => account.type === "farcaster"
    );

    if (!fcAccount || fcAccount.type !== "farcaster" || !fcAccount.fid) return null;

    return {
      fid: fcAccount.fid,
      username: fcAccount.username || undefined,
      displayName: fcAccount.displayName || undefined,
      pfpUrl: fcAccount.pfp || undefined,
      signerPublicKey: fcAccount.signerPublicKey || undefined,
    };
  }, [user]);

  // Check if user has authorized Farcaster signer
  const hasAuthorizedSigner = useMemo(() => {
    return !!farcasterAccount?.signerPublicKey;
  }, [farcasterAccount]);

  // Check if user is connected with Farcaster
  const isConnectedWithFarcaster = useMemo(() => {
    return !!farcasterAccount;
  }, [farcasterAccount]);

  /**
   * Login with Farcaster
   */
  const loginWithFarcaster = useCallback(async () => {
    try {
      await login();
    } catch (error) {
      console.error("Farcaster login error:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to login",
      }));
    }
  }, [login]);

  /**
   * Authorize Farcaster signer (required before posting)
   */
  const authorizeSigner = useCallback(async () => {
    if (!farcasterAccount) {
      setState((prev) => ({
        ...prev,
        error: "Please connect your Farcaster account first",
      }));
      return false;
    }

    if (hasAuthorizedSigner) {
      return true; // Already authorized
    }

    try {
      await requestFarcasterSignerFromWarpcast();
      return true;
    } catch (error) {
      console.error("Signer authorization error:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to authorize signer",
      }));
      return false;
    }
  }, [farcasterAccount, hasAuthorizedSigner, requestFarcasterSignerFromWarpcast]);

  /**
   * Post a cast to Farcaster
   */
  const postCast = useCallback(
    async (text: string): Promise<CastResult> => {
      // Validation
      if (!authenticated || !user) {
        return { success: false, error: "Please login first" };
      }

      if (!farcasterAccount) {
        return { success: false, error: "Please connect your Farcaster account" };
      }

      if (!hasAuthorizedSigner) {
        return { success: false, error: "Please authorize your Farcaster signer first" };
      }

      if (!text || text.trim().length === 0) {
        return { success: false, error: "Cast text cannot be empty" };
      }

      setState((prev) => ({ ...prev, isPosting: true, error: null }));

      try {
        // Create Privy signer
        const privySigner = new ExternalEd25519Signer(
          signFarcasterMessage,
          getFarcasterSignerPublicKey
        );

        // Create Hub client
        const client = new HubRestAPIClient({
          hubUrl: FARCASTER_HUB_URL,
        });

        // Submit cast
        const response = await client.submitCast(
          { text: text.trim() },
          farcasterAccount.fid,
          privySigner
        );

        const castHash = response?.hash || "unknown";

        setState({
          isPosting: false,
          error: null,
          lastCastHash: castHash,
        });

        return { success: true, hash: castHash };
      } catch (error) {
        console.error("Post cast error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to post cast";

        setState((prev) => ({
          ...prev,
          isPosting: false,
          error: errorMessage,
        }));

        return { success: false, error: errorMessage };
      }
    },
    [
      authenticated,
      user,
      farcasterAccount,
      hasAuthorizedSigner,
      signFarcasterMessage,
      getFarcasterSignerPublicKey,
    ]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // Auth state
    isAuthenticated: authenticated,
    user,
    farcasterAccount,
    isConnectedWithFarcaster,
    hasAuthorizedSigner,

    // Actions
    loginWithFarcaster,
    authorizeSigner,
    postCast,
    logout,
    clearError,

    // Posting state
    isPosting: state.isPosting,
    error: state.error,
    lastCastHash: state.lastCastHash,
  };
}
