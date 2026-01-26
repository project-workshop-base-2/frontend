import { BuyCreditsForm } from '@/components/BuyCreditsForm';
import { CreditBalanceDisplay } from '@/components/CreditBalanceDisplay';
import { UseCreditsForm } from '@/components/UseCreditsForm';

export default function Home() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>💰 IDRX Payment Portal</h1>
        <p>Purchase credits using IDRX stablecoin on Base Sepolia</p>
      </header>

      <main className="main-content">
        {/* Credit Balance Display - Full Width */}
        <div className="balance-section">
          <CreditBalanceDisplay />
        </div>

        {/* Two Column Grid for Buy and Use Credits */}
        <div className="actions-grid">
          <BuyCreditsForm />
          <UseCreditsForm />
        </div>
      </main>

      <footer className="app-footer">
        <p>Powered by OnchainKit & IDRX</p>
      </footer>
    </div>
  );
}
