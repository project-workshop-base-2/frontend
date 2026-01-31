import mockIDRXAbi from './mockIDRX_abi.json';

export const CONTRACTS = {
  MOCK_IDRX: {
    address: '0xcc196B641D0A05CE66c7f1daC7A4F748b07866FC' as `0x${string}`, // Updated: 5 min cooldown, 2 decimals
    abi: mockIDRXAbi,
  },
} as const;

export const FAUCET_CONFIG = {
  MAX_AMOUNT: 10_000n * 10n ** 2n, // 10,000 IDRX with 2 decimals (Indonesian Rupiah format)
  COOLDOWN_SECONDS: 300, // 5 minutes (for testing)
  DEFAULT_AMOUNT: 1_000n * 10n ** 2n, // 1,000 IDRX with 2 decimals
} as const;
