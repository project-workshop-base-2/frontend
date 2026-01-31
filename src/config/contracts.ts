import mockIDRXAbi from './mockIDRX_abi.json';

export const CONTRACTS = {
  MOCK_IDRX: {
    address: '0x1C560Ab8638a865909E8FcAfF92686fE26bFaf03' as `0x${string}`,
    abi: mockIDRXAbi,
  },
} as const;

export const FAUCET_CONFIG = {
  MAX_AMOUNT: 10_000n * 10n ** 6n, // 10,000 IDRX with 6 decimals
  COOLDOWN_SECONDS: 86400, // 24 hours
  DEFAULT_AMOUNT: 1_000n * 10n ** 6n, // 1,000 IDRX
} as const;
