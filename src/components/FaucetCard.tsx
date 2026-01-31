"use client";

import { useState, useEffect } from "react";
import { Coins, Clock, Check, AlertCircle } from "lucide-react";
import { useFaucet } from "@/hooks/useFaucet";
import { FAUCET_CONFIG } from "@/config/contracts";

export function FaucetCard() {
  const {
    canClaim,
    isLoading,
    isDataLoading,
    isClaiming,
    remainingTime,
    balance,
    claimFaucet,
    error,
    txHash,
  } = useFaucet();

  const [selectedAmount, setSelectedAmount] = useState<bigint>(FAUCET_CONFIG.DEFAULT_AMOUNT);
  const [countdown, setCountdown] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Format balance to readable number (2 decimals for IDRX)
  const formattedBalance = (Number(balance) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Amount presets (2 decimals for IDRX)
  const amountPresets = [
    { label: "1K", value: 1_000n * 10n ** 2n },
    { label: "5K", value: 5_000n * 10n ** 2n },
    { label: "10K", value: 10_000n * 10n ** 2n },
  ];

  // Countdown timer
  useEffect(() => {
    if (remainingTime === 0) {
      setCountdown("");
      return;
    }

    const interval = setInterval(() => {
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);
      const seconds = remainingTime % 60;

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  // Show success message when tx completes
  useEffect(() => {
    if (txHash && !isLoading) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [txHash, isLoading]);

  const handleClaim = async () => {
    await claimFaucet(selectedAmount);
  };

  const getButtonState = () => {
    if (isDataLoading) return { text: "Loading...", disabled: true };
    if (isLoading) return { text: "Processing...", disabled: true };
    if (isClaiming) return { text: "Claiming...", disabled: true };
    if (!canClaim) return { text: `Next claim in ${countdown}`, disabled: true };
    return { text: "Claim IDRX Tokens", disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/30 rounded-xl flex items-center justify-center">
            <Coins className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">IDRX Faucet</h3>
            <p className="text-xs text-gray-400">Free testnet tokens</p>
          </div>
        </div>
        {isDataLoading ? (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : canClaim ? (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <Check className="w-3 h-3" />
            Available
          </div>
        ) : remainingTime > 0 ? (
          <div className="flex items-center gap-1 text-xs text-orange-400">
            <Clock className="w-3 h-3" />
            Cooldown
          </div>
        ) : null}
      </div>

      {/* Balance Display */}
      <div className="bg-[#0F1328] rounded-xl p-4 mb-4">
        <div className="text-xs text-gray-400 mb-1">Your Balance</div>
        <div className="text-2xl font-bold text-white">{formattedBalance} IDRX</div>
      </div>

      {/* Amount Selector */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Select Amount</div>
        <div className="grid grid-cols-3 gap-2">
          {amountPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setSelectedAmount(preset.value)}
              disabled={isLoading || isClaiming}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedAmount === preset.value
                  ? "bg-blue-600 text-white"
                  : "bg-[#1A1F3A] text-gray-400 hover:bg-blue-600/30 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={buttonState.disabled}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors"
      >
        {isLoading || isClaiming ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : !canClaim && remainingTime > 0 ? (
          <Clock className="w-4 h-4" />
        ) : (
          <Coins className="w-4 h-4" />
        )}
        {buttonState.text}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && txHash && (
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-green-400 font-semibold">Successfully claimed!</p>
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline mt-1 inline-block"
            >
              View transaction
            </a>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-blue-700/30">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Cooldown Period:</span>
            <span className="text-white">5 minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Max Per Claim:</span>
            <span className="text-white">10,000 IDRX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
