'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout';
import { CreditBalanceDisplay } from '@/components/CreditBalanceDisplay';
import { BuyCreditsForm } from '@/components/BuyCreditsForm';
import { UseCreditsForm } from '@/components/UseCreditsForm';

export default function WalletPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0D1F]">
      <div className="max-w-[430px] mx-auto text-white pb-20">
        {/* Header */}
        <header className="px-4 py-4 flex items-center gap-3 bg-[#0F1328]">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Wallet</h1>
            <p className="text-xs text-gray-400">Manage your credits</p>
          </div>
        </header>

        {/* Balance Display */}
        <div className="px-4 py-6">
          <CreditBalanceDisplay />
        </div>

        {/* Buy and Use Credits */}
        <div className="px-4 pb-6 space-y-4">
          <div className="bg-[#1A1F3A] border border-blue-700/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Buy Credits</h2>
            <BuyCreditsForm />
          </div>

          <div className="bg-[#1A1F3A] border border-blue-700/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Use Credits</h2>
            <UseCreditsForm />
          </div>
        </div>

        <Navbar />
      </div>
    </div>
  );
}
