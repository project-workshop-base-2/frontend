/**
 * Version check untuk force reload saat contract address berubah
 * Ini memastikan mobile browser selalu pakai contract address terbaru
 */

import { CONTRACTS } from '@/config/contracts';

const VERSION_KEY = 'app_contract_version';
const CURRENT_VERSION = CONTRACTS.MOCK_IDRX.address;

export function checkAndUpdateVersion() {
  if (typeof window === 'undefined') return;

  const storedVersion = localStorage.getItem(VERSION_KEY);

  if (storedVersion && storedVersion !== CURRENT_VERSION) {
    console.log('🔄 Contract address changed, clearing cache and reloading...', {
      old: storedVersion,
      new: CURRENT_VERSION,
    });

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Set new version
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);

    // Force reload (bypass cache)
    window.location.reload();
  } else if (!storedVersion) {
    // First time visit
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }
}
