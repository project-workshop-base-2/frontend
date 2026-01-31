'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Address, Identity } from '@coinbase/onchainkit/identity';
import { SignInButton, useProfile } from '@farcaster/auth-kit';
import { Zap, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { isFullyAuthenticated, isWalletConnected, isFarcasterConnected } = useAuth();
  const { profile } = useProfile();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isFullyAuthenticated) {
      router.push('/dashboard');
    }
  }, [isFullyAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0D1F] to-[#1A1F3A] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to AI Content Studio
          </h1>
          <p className="text-gray-400">
            Generate engaging content for Farcaster with AI
          </p>
        </div>

        {/* Login Steps */}
        <div className="bg-[#0F1328] border border-blue-700/30 rounded-2xl p-6 space-y-6">
          {/* Step 1: Base Account */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isWalletConnected
                    ? 'bg-green-500'
                    : 'bg-gray-700'
                }`}>
                  {isWalletConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white text-xs font-bold">1</span>
                  )}
                </div>
                <h3 className="text-white font-semibold">Connect Base Account</h3>
              </div>
            </div>

            {!isWalletConnected ? (
              <div className="pl-8">
                <p className="text-sm text-gray-400 mb-3">
                  Connect your wallet to get started with Base
                </p>
                <Wallet>
                  <ConnectWallet className="w-full" />
                </Wallet>
              </div>
            ) : (
              <div className="pl-8 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Wallet Connected
                </p>
                {address && (
                  <div className="mt-2">
                    <Identity
                      address={address}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-6 w-6" />
                      <div className="text-xs text-gray-300">
                        <Address />
                      </div>
                    </Identity>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-blue-700/30"></div>

          {/* Step 2: Farcaster Account */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isFarcasterConnected
                    ? 'bg-green-500'
                    : isWalletConnected
                      ? 'bg-blue-600'
                      : 'bg-gray-700'
                }`}>
                  {isFarcasterConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white text-xs font-bold">2</span>
                  )}
                </div>
                <h3 className="text-white font-semibold">Connect Farcaster</h3>
              </div>
            </div>

            {!isFarcasterConnected ? (
              <div className="pl-8">
                <p className="text-sm text-gray-400 mb-3">
                  {isWalletConnected
                    ? 'Sign in with your Farcaster account to post content'
                    : 'Complete Step 1 first'}
                </p>
                {isWalletConnected && (
                  <div className="farcaster-signin-wrapper">
                    <SignInButton
                      nonce={async () => {
                        try {
                          const response = await fetch('/api/farcaster/nonce');
                          const data = await response.json();
                          return data.nonce;
                        } catch (error) {
                          console.error('Failed to fetch nonce:', error);
                          throw error;
                        }
                      }}
                      onSuccess={({ fid, username }) => {
                        console.log(`✅ Signed in as @${username} (FID: ${fid})`);
                      }}
                      onError={(error) => {
                        console.error('❌ Farcaster sign in error:', error);
                        alert(`Sign in failed: ${error?.message || 'Unknown error'}`);
                      }}
                      onSignOut={() => {
                        console.log('Signed out from Farcaster');
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="pl-8 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Farcaster Connected
                </p>
                {profile && (
                  <div className="mt-2 flex items-center gap-2">
                    {profile.pfpUrl && (
                      <img
                        src={profile.pfpUrl}
                        alt={profile.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-xs text-gray-300">
                      @{profile.username}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Continue Button */}
          {isFullyAuthenticated && (
            <>
              <div className="border-t border-blue-700/30"></div>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Continue to Dashboard
                <Zap className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
