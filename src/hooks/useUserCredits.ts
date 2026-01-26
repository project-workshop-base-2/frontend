'use client';

import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { useState, useEffect } from 'react';
import { PAYMENT_GATEWAY_ADDRESS } from '@/contract';
import PAYMENT_GATEWAY_ABI from '@/abi/x402.json';

/**
 * Custom hook untuk mengelola credit balance user
 * Membaca balance dari smart contract dan auto-refresh ketika ada perubahan
 */
export function useUserCredits() {
    const { address, isConnected } = useAccount();
    const [refreshKey, setRefreshKey] = useState(0);



    // Read credit balance dari smart contract dengan auto-polling
    // Using creditBalance (public mapping) instead of getCreditBalance (getter function)
    const {
        data: creditBalance,
        isLoading,
        refetch,
        isFetching,
        error,
        status
    } = useReadContract({
        address: PAYMENT_GATEWAY_ADDRESS as `0x${string}`,
        abi: PAYMENT_GATEWAY_ABI,
        functionName: 'creditBalance', // Changed from 'getCreditBalance' to 'creditBalance'
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && isConnected,
            refetchInterval: 5000, // Poll every 5 seconds for real-time updates
        },
    });



    // Watch untuk CreditsUsed event
    useWatchContractEvent({
        address: PAYMENT_GATEWAY_ADDRESS as `0x${string}`,
        abi: PAYMENT_GATEWAY_ABI,
        eventName: 'CreditsUsed',
        enabled: !!address && isConnected,
        onLogs: () => {
            refetch();
            setRefreshKey(prev => prev + 1);
        },
    });

    // Watch untuk CreditsPurchased event
    useWatchContractEvent({
        address: PAYMENT_GATEWAY_ADDRESS as `0x${string}`,
        abi: PAYMENT_GATEWAY_ABI,
        eventName: 'CreditsPurchased',
        enabled: !!address && isConnected,
        onLogs: () => {
            refetch();
            setRefreshKey(prev => prev + 1);
        },
    });

    // Manual refetch function
    const refreshBalance = () => {
        refetch();
        setRefreshKey(prev => prev + 1);
    };

    return {
        creditBalance: creditBalance as bigint | undefined,
        isLoading,
        isFetching,
        refreshBalance,
        isConnected,
        address,
    };
}
