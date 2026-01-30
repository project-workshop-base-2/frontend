'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { useState, type ReactNode } from 'react';
import { AuthKitProvider } from '@farcaster/auth-kit';

import '@coinbase/onchainkit/styles.css';
import '@farcaster/auth-kit/styles.css';

const wagmiConfig = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(),
    },
});

const farcasterConfig = {
    rpcUrl: 'https://mainnet.optimism.io',
    domain: process.env.NEXT_PUBLIC_FARCASTER_DOMAIN || 'localhost:3000',
    siweUri: process.env.NEXT_PUBLIC_FARCASTER_SIWE_URI || 'http://localhost:3000',
};

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    // If Privy is not configured, render without it
    if (!privyAppId) {
        return (
            <AuthKitProvider config={farcasterConfig}>
                <WagmiProvider config={wagmiConfig}>
                    <QueryClientProvider client={queryClient}>
                        <OnchainKitProvider
                            chain={baseSepolia}
                            config={{
                                appearance: {
                                    mode: 'auto',
                                    theme: 'default',
                                },
                            }}
                        >
                            {children}
                        </OnchainKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </AuthKitProvider>
        );
    }

    return (
        <AuthKitProvider config={farcasterConfig}>
            <PrivyProvider
                appId={privyAppId}
                config={{
                    loginMethods: ['email', 'wallet'],
                    appearance: {
                        theme: 'light',
                        accentColor: '#0066ff',
                    },
                    embeddedWallets: {
                        ethereum: {
                            createOnLogin: 'off',
                        },
                    },
                }}
            >
                <WagmiProvider config={wagmiConfig}>
                    <QueryClientProvider client={queryClient}>
                        <OnchainKitProvider
                            chain={baseSepolia}
                            config={{
                                appearance: {
                                    mode: 'auto',
                                    theme: 'default',
                                },
                            }}
                        >
                            {children}
                        </OnchainKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </PrivyProvider>
        </AuthKitProvider>
    );
}
