import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export function getWagmiConfig() {
  return createConfig({
    chains: [baseSepolia, base],
    connectors: [
      coinbaseWallet({
        appName: 'AI Content Studio',
        preference: 'smartWalletOnly', // Smart Wallet only for better UX
        version: '4',
      }),
    ],
    storage: createStorage({
      storage: cookieStorage, // SSR-safe persistent storage
    }),
    ssr: true, // Enable server-side rendering support
    transports: {
      [baseSepolia.id]: http(),
      [base.id]: http(),
    },
  });
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getWagmiConfig>;
  }
}
