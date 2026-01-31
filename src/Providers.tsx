import React from 'react';
import { Web3OnboardProvider, init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import { ThemeProvider } from 'next-themes';

// iExec Bellecour Sidechain Configuration
export const bellecour = {
    id: 134,
    token: 'xRLC',
    label: 'iExec Sidechain',
    rpcUrl: 'https://bellecour.iexec.net'
};


// Initialize Web3-Onboard
const injected = injectedModule();

const web3Onboard = init({
    wallets: [injected],
    chains: [bellecour],
    appMetadata: {
        name: 'REPUTATION ENGINE',
        icon: '<svg>...</svg>', // Add your app icon here
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <Web3OnboardProvider web3Onboard={web3Onboard}>
                {children}
            </Web3OnboardProvider>
        </ThemeProvider>
    );
}
