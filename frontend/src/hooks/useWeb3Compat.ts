import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { useMemo, useEffect, useState } from 'react';

export function useAccount() {
    const [{ wallet, connecting }] = useConnectWallet();

    return useMemo(() => ({
        address: wallet?.accounts[0]?.address as `0x${string}` | undefined,
        isConnected: !!wallet,
        isConnecting: connecting,
        isDisconnected: !wallet,
    }), [wallet, connecting]);
}

/**
 * Compatibility hook to replace wagmi's useDisconnect
 */
export function useDisconnect() {
    const [{ wallet }, , disconnect] = useConnectWallet();

    return useMemo(() => ({
        disconnect: async () => {
            if (wallet) {
                // Clear persistence
                localStorage.removeItem('cached_wallet_label');
                await disconnect(wallet);
            }
        },
        isSuccess: false,
        isError: false,
    }), [wallet, disconnect]);
}

/**
 * Hook to restore session on reload
 */
export function useSessionRestore() {
    const [{ wallet, connecting }, connect] = useConnectWallet();
    const [{ connectedChain }, setChain] = useSetChain();
    const [isRestoring, setIsRestoring] = useState(true);

    // 1. Auto-connect on mount if previously connected
    useEffect(() => {
        const label = localStorage.getItem('cached_wallet_label');

        if (label && !wallet) {
            console.log("Attempting to restore session for:", label);
            connect({ autoSelect: { label, disableModals: true } })
                .then(async (state) => {
                    console.log("Session restore attempt finished");
                    // Force Chain Switch if needed
                    if (state && state.length > 0) {
                        const currentChain = state[0].chains[0].id;
                        if (currentChain !== '0x66eee') { // 421614
                            console.log("Wrong chain detected. Switching to Arbitrum Sepolia Testnet...");
                            await setChain({ chainId: '0x66eee' });
                        }
                    }
                })
                .catch(err => {
                    console.error("Session restore failed:", err);
                    localStorage.removeItem('cached_wallet_label');
                })
                .finally(() => {
                    // Slight delay to ensure state updates propagate
                    setTimeout(() => setIsRestoring(false), 50);
                });
        } else {
            // No previous session or already connected
            setIsRestoring(false);
        }
    }, []); // Run once

    // 2. Save label when connected
    useEffect(() => {
        if (wallet?.label) {
            localStorage.setItem('cached_wallet_label', wallet.label);
        }
    }, [wallet]);

    // 3. Watch for chain changes during active session (optional, but good for safety)
    useEffect(() => {
        if (wallet && connectedChain && connectedChain.id !== '0x66eee') {
            // We could force switch here too, but might be intrusive. 
            // For now, relying on the connect-time switch.
            // Uncomment to strictly enforce: setChain({ chainId: '0x86' });
        }
    }, [wallet, connectedChain]);

    // Derived restoring state: either our local flag OR the lib's connecting state
    // We expect 'connecting' to become true quickly after we call connect().
    return { isRestoring: isRestoring || connecting };
}

/**
 * Compatibility hook to replace wagmi's useConnectorClient
 * Returns the wallet provider for use with ethers or web3
 */
export function useConnectorClient({ chainId }: { chainId?: number } = {}) {
    const [{ wallet }] = useConnectWallet();

    return useMemo(() => ({
        data: wallet ? {
            account: { address: wallet.accounts[0]?.address as `0x${string}` },
            chain: { id: chainId || parseInt(wallet.chains[0]?.id || '1', 16) },
            transport: wallet.provider, // Return actual provider, not { type: 'custom' }
            getProvider: () => wallet.provider,
        } : undefined,
        isError: false,
        isLoading: false,
    }), [wallet, chainId]);
}
