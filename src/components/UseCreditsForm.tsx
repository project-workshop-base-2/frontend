'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { encodeFunctionData } from 'viem';
import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusLabel,
    TransactionStatusAction,
} from '@coinbase/onchainkit/transaction';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Identity, Address } from '@coinbase/onchainkit/identity';

import { PAYMENT_GATEWAY_ADDRESS } from '@/contract';
import PAYMENT_GATEWAY_ABI from '@/abi/x402.json';
import { useUserCredits } from '@/hooks/useUserCredits';

/**
 * Form untuk menggunakan/mengurangi credit
 * Menggunakan OnchainKit Transaction untuk memanggil fungsi useCredits
 */
export function UseCreditsForm() {
    const [mounted, setMounted] = useState(false);
    const { address, isConnected } = useAccount();
    const { creditBalance, isLoading, refreshBalance } = useUserCredits();

    useEffect(() => {
        setMounted(true);
    }, []);

    const [amount, setAmount] = useState<string>('1');
    const [reason, setReason] = useState<string>('AI Content Generation');

    const balance = creditBalance ? Number(creditBalance) : 0;
    const amountNum = parseInt(amount) || 0;
    const hasEnoughCredits = balance >= amountNum && amountNum > 0;

    // Encode useCredits function call data
    const useCreditsData = encodeFunctionData({
        abi: PAYMENT_GATEWAY_ABI,
        functionName: 'useCredits',
        args: [BigInt(amountNum), reason],
    });

    // Transaction calls
    const useCreditsCall = [
        {
            to: PAYMENT_GATEWAY_ADDRESS as `0x${string}`,
            data: useCreditsData,
        },
    ];

    // Handle success
    const handleSuccess = () => {
        refreshBalance();
        // Reset form
        setAmount('1');
        setReason('AI Content Generation');
    };

    if (!mounted) return null;

    if (!isConnected) {
        return (
            <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">Connect your wallet to use credits</p>
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
        <div className="space-y-4">
            {/* Current Balance Display */}
            <div className="bg-[#0F1328] rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Available Credits</span>
                    <span className="font-bold text-blue-400">
                        {isLoading ? (
                            <span className="animate-pulse">Loading...</span>
                        ) : (
                            `${balance} Credits`
                        )}
                    </span>
                </div>
            </div>

            {/* Input Form */}
            <div className="space-y-3">
                <div>
                    <label htmlFor="amount" className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                        Amount
                    </label>
                    <input
                        id="amount"
                        type="number"
                        min="1"
                        max={balance}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter credit amount"
                        className="w-full bg-[#1A1F3A] border border-blue-700/30 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="reason" className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                        Reason / Purpose
                    </label>
                    <input
                        id="reason"
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., AI Content Generation"
                        className="w-full bg-[#1A1F3A] border border-blue-700/30 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Insufficient Credits Warning */}
            {!hasEnoughCredits && !isLoading && amountNum > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                    ⚠️ Insufficient credits. You have {balance} credits but need {amountNum}.
                </div>
            )}

            {/* Transaction Section */}
            <div>
                <Transaction
                    chainId={84532}
                    calls={useCreditsCall}
                    onSuccess={handleSuccess}
                >
                    <TransactionButton
                        text={`Use ${amountNum} Credit${amountNum !== 1 ? 's' : ''}`}
                        disabled={!hasEnoughCredits || isLoading || !reason.trim()}
                        className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
                    />
                    <TransactionStatus>
                        <TransactionStatusLabel />
                        <TransactionStatusAction />
                    </TransactionStatus>
                </Transaction>
            </div>

            {/* Info Section */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-gray-400">
                💡 Credits will be deducted from your balance after successful transaction.
            </div>
        </div>
    );
}
