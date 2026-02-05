import React from 'react';
import { Web3OnboardProvider, init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import { ThemeProvider } from 'next-themes';
import favicon from './favicon.svg'
// iExec Arbitrum Sepolia Testnet Configuration
export const arbitrumSepolia = {
    id: 421614,
    token: 'ETH',
    label: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc'
};


// Inline SVG app icon to show in wallet UI
const appIcon = favicon;

// Initialize Web3-Onboard
const injected = injectedModule();

const web3Onboard = init({
    wallets: [injected],
    chains: [arbitrumSepolia],
    appMetadata: {
        name: 'Scorely',
        icon: appIcon,
        description: 'Privacy-preserving confidential computing on iExec',
        recommendedInjectedWallets: [
            { name: 'MetaMask', url: 'https://metamask.io' },
            { name: 'Trust Wallet', url: 'https://trustwallet.com' }
        ]
    },
    accountCenter: {
        desktop: {
            enabled: false
        },
        mobile: {
            enabled: false
        }
    },
    theme: 'dark'
});

// Make onboard accessible globally for custom wallet UI
if (typeof window !== 'undefined') {
    (window as any).onboard = web3Onboard;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            forcedTheme="dark"
            themes={["dark"]}
            storageKey="scorely-theme"
            enableSystem={false}
        >
            <Web3OnboardProvider web3Onboard={web3Onboard}>
                {children}
            </Web3OnboardProvider>
        </ThemeProvider>
    );
}
