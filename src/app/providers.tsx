'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type State, WagmiProvider } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { useState, useEffect, type ReactNode } from 'react';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { sdk } from '@farcaster/miniapp-sdk';
import { AuthProvider } from '@/contexts/AuthContext';
import { getWagmiConfig } from '@/lib/wagmi';

import '@coinbase/onchainkit/styles.css';
import '@farcaster/auth-kit/styles.css';

const farcasterConfig = {
    rpcUrl: 'https://mainnet.optimism.io',
    domain: process.env.NEXT_PUBLIC_FARCASTER_DOMAIN ||
            (typeof window !== 'undefined' ? window.location.host : 'localhost:3000'),
    siweUri: process.env.NEXT_PUBLIC_FARCASTER_SIWE_URI ||
             (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
};

export function Providers({
    children,
    initialState
}: {
    children: ReactNode;
    initialState?: State;
}) {
    const [config] = useState(() => getWagmiConfig());
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                refetchOnWindowFocus: false,
            },
        },
    }));

    // Initialize Farcaster miniapp SDK
    useEffect(() => {
        sdk.actions.ready();
    }, []);

    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    // Main provider setup with custom Wagmi config
    if (!privyAppId) {
        return (
            <AuthKitProvider config={farcasterConfig}>
                <WagmiProvider config={config} initialState={initialState}>
                    <QueryClientProvider client={queryClient}>
                        <OnchainKitProvider
                            apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
                            chain={baseSepolia}
                            config={{
                                appearance: {
                                    mode: 'auto',
                                    theme: 'default',
                                },
                            }}
                            miniKit={{
                                enabled: true,
                                autoConnect: true,
                            }}
                        >
                            <AuthProvider>
                                {children}
                            </AuthProvider>
                        </OnchainKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </AuthKitProvider>
        );
    }

    return (
        <AuthKitProvider config={farcasterConfig}>
            <WagmiProvider config={config} initialState={initialState}>
                <QueryClientProvider client={queryClient}>
                    <OnchainKitProvider
                        apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
                        chain={baseSepolia}
                        config={{
                            appearance: {
                                mode: 'auto',
                                theme: 'default',
                            },
                        }}
                        miniKit={{
                            enabled: true,
                            autoConnect: true,
                        }}
                    >
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </OnchainKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </AuthKitProvider>
    );
}
