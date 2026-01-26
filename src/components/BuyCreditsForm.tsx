'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
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

import { IDRX_ADDRESS, PAYMENT_GATEWAY_ADDRESS } from '@/contract';
import IDRX_ABI from '@/abi/mockidrx.json';
import PAYMENT_GATEWAY_ABI from '@/abi/x402.json';

// Constants (2 decimals for IDRX like USDC)
const IDRX_DECIMALS = 2;

// Format number as Indonesian Rupiah
function formatIDR(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format IDRX balance for display from raw bigint
function formatBalanceRaw(balance: bigint | undefined): string {
    if (balance === undefined) return '0';
    const divisor = BigInt(10 ** IDRX_DECIMALS);
    const wholePart = Number(balance) / Number(divisor);
    return formatIDR(wholePart);
}

export function BuyCreditsForm() {
    const [mounted, setMounted] = useState(false);
    const { address, isConnected } = useAccount();

    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. Read Credit Price dynamically from Contract
    const { data: pricePerCreditRaw, isLoading: priceLoading } = useReadContract({
        address: PAYMENT_GATEWAY_ADDRESS as `0x${string}`,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: 'idrxPricePerCredit',
    });

    // 2. Read IDRX Balance
    const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useReadContract({
        address: IDRX_ADDRESS as `0x${string}`,
        abi: IDRX_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    // 3. Read IDRX Allowance for Payment Gateway
    const { data: allowance, isLoading: allowanceLoading, refetch: refetchAllowance } = useReadContract({
        address: IDRX_ADDRESS as `0x${string}`,
        abi: IDRX_ABI,
        functionName: 'allowance',
        args: address ? [address, PAYMENT_GATEWAY_ADDRESS] : undefined,
        query: { enabled: !!address },
    });

    // 4. Read Current Credit Balance from Smart Contract
    const { data: creditBalance, isLoading: creditLoading, refetch: refetchCredits } = useReadContract({
        address: PAYMENT_GATEWAY_ADDRESS as `0x${string}`,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: 'creditBalance',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && isConnected,
            refetchInterval: 5000, // Poll every 5 seconds
        },
    });

    const isLoading = priceLoading || balanceLoading || allowanceLoading || creditLoading;

    // Dynamic price calculation
    const creditPriceRaw = (pricePerCreditRaw as bigint) ?? BigInt(0);
    const currentCredits = creditBalance ? Number(creditBalance) : 0;

    const hasEnoughAllowance = allowance ? (allowance as bigint) >= creditPriceRaw : false;
    const hasEnoughBalance = balance ? (balance as bigint) >= creditPriceRaw : false;

    // Determine which transaction to show
    const needsApproval = !hasEnoughAllowance;

    // Encode approve function call data
    const approveData = encodeFunctionData({
        abi: IDRX_ABI,
        functionName: 'approve',
        args: [PAYMENT_GATEWAY_ADDRESS, creditPriceRaw],
    });

    // Encode buyCreditsWithIDRX function call data
    const buyCreditsData = encodeFunctionData({
        abi: PAYMENT_GATEWAY_ABI,
        functionName: 'buyCreditsWithIDRX',
        args: [BigInt(1)], // Buy 1 credit
    });

    // Approve Transaction Calls
    const approveCalls = [
        {
            to: IDRX_ADDRESS as `0x${string}`,
            data: approveData,
        },
    ];

    // Buy Credits Transaction Calls
    const buyCreditsCall = [
        {
            to: PAYMENT_GATEWAY_ADDRESS as `0x${string}`,
            data: buyCreditsData,
        },
    ];

    // Refetch data after successful transaction
    const handleSuccess = () => {
        refetchBalance();
        refetchAllowance();
        refetchCredits(); // Refresh credit balance
    };

    if (!mounted) return null;

    if (!isConnected) {
        return (
            <div className="buy-credits-card">
                <h2>Buy Credits</h2>
                <p className="subtitle">Connect your wallet to purchase credits with IDRX</p>
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
        <div className="buy-credits-card">
            <div className="card-header">
                <h2>Buy Credits</h2>
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

            {/* Balance Display */}
            <div className="balance-section">
                <div className="balance-row">
                    <span className="label">Current Credits</span>
                    <span className="value">
                        {creditLoading ? 'Loading...' : `${currentCredits} Credits`}
                    </span>
                </div>
                <div className="balance-row">
                    <span className="label">IDRX Balance</span>
                    <span className="value">
                        {balanceLoading ? 'Loading...' : formatBalanceRaw(balance as bigint)}
                    </span>
                </div>
                <div className="balance-row">
                    <span className="label">Credit Price</span>
                    <span className="value highlight">
                        {priceLoading ? 'Loading...' : formatBalanceRaw(creditPriceRaw)}
                    </span>
                </div>
                {hasEnoughAllowance && !isLoading && (
                    <div className="balance-row">
                        <span className="label">Status</span>
                        <span className="value approved">✓ Approved</span>
                    </div>
                )}
            </div>

            {/* Insufficient Balance Warning */}
            {!hasEnoughBalance && !isLoading && (
                <div className="warning">
                    ⚠️ Insufficient IDRX balance. You need at least {formatBalanceRaw(creditPriceRaw)}.
                </div>
            )}

            {/* Transaction Section */}
            <div className="transaction-section">
                {needsApproval ? (
                    <Transaction
                        chainId={84532}
                        calls={approveCalls}
                        onSuccess={handleSuccess}
                    >
                        <TransactionButton
                            text="Approve IDRX Usage"
                            disabled={!hasEnoughBalance || isLoading}
                            className="tx-button approve"
                        />
                        <TransactionStatus>
                            <TransactionStatusLabel />
                            <TransactionStatusAction />
                        </TransactionStatus>
                    </Transaction>
                ) : (
                    <Transaction
                        chainId={84532}
                        calls={buyCreditsCall}
                        onSuccess={handleSuccess}
                    >
                        <TransactionButton
                            text={`Buy Credits (${formatBalanceRaw(creditPriceRaw)})`}
                            disabled={!hasEnoughBalance || isLoading}
                            className="tx-button buy"
                        />
                        <TransactionStatus>
                            <TransactionStatusLabel />
                            <TransactionStatusAction />
                        </TransactionStatus>
                    </Transaction>
                )}
            </div>

            {/* Info Section */}
            <div className="info-section">
                <p>
                    💡 {needsApproval
                        ? 'First, approve the IDRX spending. Then you can buy credits.'
                        : 'You\'re ready to buy credits!'}
                </p>
            </div>
        </div>
    );
}
