'use client'

import React from 'react'
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import { ThemeProvider } from 'next-themes'
import favicon from './favicon.svg'

/* ----------------------------------------
   Arbitrum Sepolia (Web3-Onboard Chain)
   NOTE: DO NOT TYPE THIS OBJECT
----------------------------------------- */
export const arbitrumSepolia = {
  id: '0x66eee', // 421614 (hex)
  token: 'ETH',
  label: 'Arbitrum Sepolia',
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc'
}

/* ----------------------------------------
   Wallet Modules
----------------------------------------- */
const injected = injectedModule()

/* ----------------------------------------
   Web3-Onboard Init
----------------------------------------- */
const web3Onboard = init({
  wallets: [injected],
  chains: [arbitrumSepolia],
  appMetadata: {
    name: 'Scorely',
    icon: favicon,
    description: 'Privacy-preserving confidential computing on iExec',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
      { name: 'Trust Wallet', url: 'https://trustwallet.com' }
    ]
  },
  accountCenter: {
    desktop: { enabled: false },
    mobile: { enabled: false }
  },
  theme: 'dark'
})

/* ----------------------------------------
   Optional: expose onboard globally
----------------------------------------- */
if (typeof window !== 'undefined') {
  ;(window as any).onboard = web3Onboard
}

/* ----------------------------------------
   Providers Wrapper
----------------------------------------- */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      forcedTheme="dark"
      themes={['dark']}
      storageKey="scorely-theme"
      enableSystem={false}
    >
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        {children}
      </Web3OnboardProvider>
    </ThemeProvider>
  )
}
