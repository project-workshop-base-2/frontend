'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useProfile } from '@farcaster/auth-kit';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

interface AuthContextType {
  // Base Account
  isWalletConnected: boolean;
  walletAddress: string | undefined;

  // Farcaster Account
  isFarcasterConnected: boolean;
  farcasterProfile: any;

  // Combined auth status
  isFullyAuthenticated: boolean;
  isLoading: boolean;

  // Mini App context
  isMiniApp: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { isAuthenticated: isFarcasterAuth, profile: farcasterProfile } = useProfile();
  const { context } = useMiniKit();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure all auth states are loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const value: AuthContextType = {
    // Base Account
    isWalletConnected: isConnected,
    walletAddress: address,

    // Farcaster Account
    isFarcasterConnected: isFarcasterAuth,
    farcasterProfile,

    // Combined - user only needs wallet to be authenticated (Farcaster is optional)
    isFullyAuthenticated: isConnected,
    isLoading,

    // Mini App
    isMiniApp: !!context,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
