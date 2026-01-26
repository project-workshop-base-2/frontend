'use client';

import { useState, useEffect } from 'react';
import { useUserCredits } from '@/hooks/useUserCredits';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';

/**
 * Komponen untuk menampilkan credit balance user
 * Auto-refresh ketika balance berubah
 */
export function CreditBalanceDisplay() {
    const [mounted, setMounted] = useState(false);
    const { creditBalance, isLoading, isFetching, refreshBalance, isConnected, address } = useUserCredits();

    useEffect(() => {
        setMounted(true);
    }, []);

    const balance = creditBalance ? Number(creditBalance) : 0;

    if (!mounted) return null;

    if (!isConnected) {
        return (
            <div className="credit-balance-card">
                <h2>Credit Balance</h2>
                <p className="subtitle">Connect your wallet to view your credits</p>
                <Wallet>
                    <ConnectWallet className="connect-btn">
                        <Avatar className="avatar" />
                        <Name />
                    </ConnectWallet>
                </Wallet>
            </div>
        );
    }

    return (
        <div className="credit-balance-card">
            <div className="card-header">
                <h2>Credit Balance</h2>
                <button
                    onClick={refreshBalance}
                    className="refresh-btn"
                    disabled={isFetching}
                >
                    {isFetching ? '🔄 Updating...' : '🔄 Refresh'}
                </button>
            </div>

            <div className="balance-display">
                <div className="balance-amount">
                    <span className="balance-number">{balance}</span>
                    <span className="balance-label">Credits</span>
                </div>
            </div>

            <div className="balance-info">
                <p className="info-text">
                    💡 Use credits to generate AI content and post on Farcaster
                </p>
                <p className="info-text" style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                    {isFetching ? 'Checking blockchain...' : 'Auto-refreshes every 5 seconds'}
                </p>
            </div>
        </div>
    );
}
