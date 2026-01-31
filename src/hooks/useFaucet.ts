"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, FAUCET_CONFIG } from "@/config/contracts";

interface UseFaucetReturn {
  canClaim: boolean;
  isLoading: boolean;
  isDataLoading: boolean;
  isClaiming: boolean;
  remainingTime: number;
  lastClaimTime: number;
  balance: bigint;
  claimFaucet: (amount?: bigint) => Promise<void>;
  checkCooldown: () => void;
  error: string | null;
  txHash?: `0x${string}`;
}

export function useFaucet(): UseFaucetReturn {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // Read user's IDRX balance
  const { data: balance = 0n, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.MOCK_IDRX.address,
    abi: CONTRACTS.MOCK_IDRX.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read if user can claim
  const { data: canClaim = false, refetch: refetchCanClaim, isLoading: isCanClaimLoading } = useReadContract({
    address: CONTRACTS.MOCK_IDRX.address,
    abi: CONTRACTS.MOCK_IDRX.abi,
    functionName: 'canClaimFaucet',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read remaining cooldown time
  const { data: remainingTime = 0, refetch: refetchCooldown, isLoading: isRemainingTimeLoading } = useReadContract({
    address: CONTRACTS.MOCK_IDRX.address,
    abi: CONTRACTS.MOCK_IDRX.abi,
    functionName: 'getTimeUntilNextClaim',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read last claim timestamp
  const { data: lastClaimTime = 0, refetch: refetchLastClaim } = useReadContract({
    address: CONTRACTS.MOCK_IDRX.address,
    abi: CONTRACTS.MOCK_IDRX.abi,
    functionName: 'lastFaucetClaim',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Write contract hook for claiming
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Claim faucet function
  const claimFaucet = useCallback(
    async (amount: bigint = FAUCET_CONFIG.DEFAULT_AMOUNT) => {
      if (!address || !isConnected) {
        setError('Please connect your wallet');
        return;
      }

      if (!canClaim) {
        setError('Faucet cooldown is still active');
        return;
      }

      if (amount > FAUCET_CONFIG.MAX_AMOUNT) {
        setError(`Maximum claim amount is ${Number(FAUCET_CONFIG.MAX_AMOUNT) / 100} IDRX`);
        return;
      }

      setError(null);
      setIsClaiming(true);

      try {
        writeContract({
          address: CONTRACTS.MOCK_IDRX.address,
          abi: CONTRACTS.MOCK_IDRX.abi,
          functionName: 'faucet',
          args: [amount],
        });
      } catch (err: any) {
        console.error('Faucet claim error:', err);
        const errorMessage = err?.message || 'Failed to claim from faucet';
        setError(errorMessage);
        setIsClaiming(false);
      }
    },
    [address, isConnected, canClaim, writeContract]
  );

  // Check cooldown manually
  const checkCooldown = useCallback(() => {
    refetchCanClaim();
    refetchCooldown();
    refetchLastClaim();
    refetchBalance();
  }, [refetchCanClaim, refetchCooldown, refetchLastClaim, refetchBalance]);

  // Auto-refresh when transaction is confirmed
  useEffect(() => {
    if (isSuccess) {
      setIsClaiming(false);
      setTxHash(hash);
      setError(null);

      // Refresh all data after successful claim
      setTimeout(() => {
        checkCooldown();
      }, 2000);
    }
  }, [isSuccess, hash, checkCooldown]);

  // Handle transaction errors
  useEffect(() => {
    if (hash && !isConfirming && !isSuccess) {
      setIsClaiming(false);
    }
  }, [hash, isConfirming, isSuccess]);

  return {
    canClaim: Boolean(canClaim),
    isLoading: isWritePending || isConfirming,
    isDataLoading: isCanClaimLoading || isRemainingTimeLoading,
    isClaiming,
    remainingTime: Number(remainingTime),
    lastClaimTime: Number(lastClaimTime),
    balance: balance as bigint,
    claimFaucet,
    checkCooldown,
    error,
    txHash,
  };
}
