'use client';

import { useState, useEffect } from 'react';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useContentHistory } from '@/hooks/useContentHistory';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { RefreshCw, Wallet as WalletIcon, Zap } from 'lucide-react';

/**
 * Komponen untuk menampilkan credit balance user
 * Auto-refresh ketika balance berubah
 */
export function CreditBalanceDisplay() {
    const [mounted, setMounted] = useState(false);
    const { creditBalance, isLoading, isFetching, refreshBalance, isConnected, address } = useUserCredits();
    const { total: totalPosts } = useContentHistory();

    useEffect(() => {
        setMounted(true);
    }, []);

    const balance = creditBalance ? Number(creditBalance) : 0;

    if (!mounted) return null;

    if (!isConnected) {
        return (
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600/30 rounded-xl flex items-center justify-center">
                        <WalletIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Credit Balance</h2>
                        <p className="text-xs text-gray-400">Connect to view your credits</p>
                    </div>
                </div>
                <Wallet>
                    <ConnectWallet className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Avatar className="w-5 h-5" />
                        <Name />
                    </ConnectWallet>
                </Wallet>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Credit Balance Card */}
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Credits</div>
                    <button
                        onClick={refreshBalance}
                        disabled={isFetching}
                        className="p-1 text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors"
                        title={isFetching ? 'Updating...' : 'Refresh balance'}
                    >
                        <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="text-2xl font-bold mb-1">{balance}</div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Zap className="w-3 h-3" />
                    <span>Available</span>
                </div>
            </div>

            {/* AI Generations Card */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 rounded-xl p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">AI Generated</div>
                <div className="text-2xl font-bold mb-1">{totalPosts}</div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>Total Posts</span>
                </div>
            </div>
        </div>
    );
}
