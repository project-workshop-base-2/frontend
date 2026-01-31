'use client';

import { useState, useEffect } from 'react';
import { Zap, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/layout';
import { CreditBalanceDisplay } from '@/components/CreditBalanceDisplay';
import { FaucetCard } from '@/components/FaucetCard';
import { useContentHistory } from '@/hooks/useContentHistory';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useUserCredits } from '@/hooks/useUserCredits';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { address } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const postsPerPage = 5;

  // Get user's credit balance
  const { creditBalance, isLoading: creditLoading } = useUserCredits();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Generate Now click with credit check
  const handleGenerateClick = () => {
    if (!creditBalance || creditBalance === 0n) {
      setShowCreditWarning(true);
    } else {
      router.push('/ai-studio');
    }
  };

  // Helper functions - must be defined before use
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED': return 'bg-green-500/20 text-green-400';
      case 'GENERATED': return 'bg-blue-500/20 text-blue-400';
      case 'FAILED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '0x...';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const { history, isLoading, error, total } = useContentHistory();

  const totalPages = Math.ceil(total / postsPerPage);

  const currentPosts = history.slice(0, postsPerPage).map((item) => ({
    id: item.id,
    hook: item.selected_hook,
    platform: "Farcaster",
    time: formatTimestamp(item.created_at),
    status: item.status.toUpperCase(),
  }));

  return (
    <div className="min-h-screen bg-[#0A0D1F]">
      <div className="max-w-[430px] mx-auto text-white pb-20">
        {/* Header */}
        <header className="px-4 py-4 flex items-center justify-between bg-[#0F1328]">
          <div>
            <div className="text-xs text-gray-400">
              {mounted ? formatAddress(address) : '0x...'}
            </div>
            <div className="text-xs text-blue-400 mt-0.5">BASE SEPOLIA</div>
          </div>
          <button
            onClick={() => router.push('/wallet')}
            className="px-3 py-1.5 border border-blue-500 text-blue-400 rounded-lg text-xs hover:bg-blue-500/10 transition-colors"
          >
            Wallet Balance
          </button>
        </header>

        {/* Balance Cards */}
        <div className="px-4 py-6">
          <CreditBalanceDisplay />
        </div>

        {/* Faucet Card */}
        <div className="px-4 pb-6">
          <FaucetCard />
        </div>

        {/* Quick Create */}
        <div className="px-4 pb-6">
          <div className="bg-[#1A1F3A] rounded-2xl p-6 relative">
            <div className="absolute top-4 right-4 px-2 py-1 bg-blue-600 rounded-md text-xs font-semibold">
              AI POWERED
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600/30 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold mb-1">Quick Create</h3>
                <p className="text-sm text-gray-400">
                  Start AI generation for your next post on Farcaster.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateClick}
              disabled={creditLoading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {creditLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Posts */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Generated Posts</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400">{currentPage}/{totalPages || 1}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 text-gray-400 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-8 text-gray-400">
              Loading your content history...
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          {!isLoading && !error && currentPosts.length === 0 && (
            <div className="bg-[#1A1F3A] border border-blue-700/30 rounded-xl p-6 text-center">
              <p className="text-gray-400 mb-2">No content generated yet</p>
              <button
                onClick={handleGenerateClick}
                className="text-blue-400 text-sm hover:underline"
              >
                Generate your first post
              </button>
            </div>
          )}

          {!isLoading && !error && currentPosts.length > 0 && (
            <div className="space-y-3">
              {currentPosts.map((post) => (
                <div key={post.id} className="bg-[#1A1F3A] border border-blue-700/30 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-gray-300 leading-relaxed flex-1">{post.hook}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{post.platform}</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Navbar />

        {/* Credit Warning Modal */}
        {showCreditWarning && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1F3A] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full relative">
              <button
                onClick={() => setShowCreditWarning(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Insufficient Credits</h3>
                  <p className="text-sm text-gray-300">
                    You need at least 1 credit to generate AI content. Please buy credits first.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowCreditWarning(false);
                    router.push('/wallet');
                  }}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors"
                >
                  Buy Credits
                </button>
                <button
                  onClick={() => setShowCreditWarning(false)}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
