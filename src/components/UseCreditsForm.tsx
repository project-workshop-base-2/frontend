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
            <div className="use-credits-card">
                <h2>Use Credits</h2>
                <p className="subtitle">Connect your wallet to use credits</p>
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
        <div className="use-credits-card">
            <div className="card-header">
                <h2>Use Credits</h2>
                <Wallet>
                    <ConnectWallet className="wallet-btn">
                        <Avatar className="avatar" />
                        <Name />
                    </ConnectWallet>
                    <WalletDropdown>
                        <Identity className="identity" hasCopyAddressOnClick>
                            <Avatar />
                            <Name />
                            <Address />
                        </Identity>
                        <WalletDropdownDisconnect />
                    </WalletDropdown>
                </Wallet>
            </div>

            {/* Current Balance Display */}
            <div className="balance-section">
                <div className="balance-row">
                    <span className="label">Available Credits</span>
                    <span className="value highlight">
                        {isLoading ? 'Loading...' : `${balance} Credits`}
                    </span>
                </div>
            </div>

            {/* Input Form */}
            <div className="form-section">
                <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                        id="amount"
                        type="number"
                        min="1"
                        max={balance}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter credit amount"
                        className="input-field"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="reason">Reason / Purpose</label>
                    <input
                        id="reason"
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., AI Content Generation"
                        className="input-field"
                    />
                </div>
            </div>

            {/* Insufficient Credits Warning */}
            {!hasEnoughCredits && !isLoading && amountNum > 0 && (
                <div className="warning">
                    ⚠️ Insufficient credits. You have {balance} credits but need {amountNum}.
                </div>
            )}

            {/* Transaction Section */}
            <div className="transaction-section">
                <Transaction
                    chainId={84532}
                    calls={useCreditsCall}
                    onSuccess={handleSuccess}
                >
                    <TransactionButton
                        text={`Use ${amountNum} Credit${amountNum !== 1 ? 's' : ''}`}
                        disabled={!hasEnoughCredits || isLoading || !reason.trim()}
                        className="tx-button use-credits"
                    />
                    <TransactionStatus>
                        <TransactionStatusLabel />
                        <TransactionStatusAction />
                    </TransactionStatus>
                </Transaction>
            </div>

            {/* Info Section */}
            <div className="info-section">
                <p>
                    💡 Credits will be deducted from your balance after successful transaction.
                </p>
            </div>
        </div>
    );
}
