import { createConnector } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { defaultChain } from '@/config/chains';

// Helper to convert Wagmi Chains to the Hex Map required by XO
function getRpcMap(chains: readonly Chain[]) {
    const rpcMap: Record<string, string> = {};
    chains.forEach((chain) => {
        const hexId = `0x${chain.id.toString(16)}`;
        // Use the first available HTTP RPC
        rpcMap[hexId] = chain.rpcUrls.default.http[0];
    });
    return rpcMap;
}

export function xoConnector() {
    let providerInstance: any = null;

    return createConnector((config) => ({
        id: 'xo-connect',
        name: 'XO Wallet',
        type: 'xo-connect',

        async connect({ chainId: _chainId } = {}): Promise<any> {
            try {
                console.log("[Debug] 1. Starting XO Connect...");
                const provider = await this.getProvider();

                console.log("[Debug] 2. Requesting eth_requestAccounts...");
                const rawAccounts = await (provider as any).request({ method: 'eth_requestAccounts' });
                console.log("[Debug] 3. Raw Accounts Response:", rawAccounts);

                const currentChainId = await this.getChainId();
                console.log("[Debug] 4. Raw ChainID:", currentChainId);

                const accounts = await this.getAccounts();

                // === ADD THIS DEBUG BLOCK ===
                const client = await (provider as any).getClient();
                console.log("🔍 [Debug] XO Client Data:", client);
                console.log("💱 [Debug] Available Currencies:", client.currencies);
                // Check what ID format the wallet uses
                client.currencies?.forEach((c: any) => {
                    console.log(`   - Currency: ${c.symbol} | ChainID in Wallet: ${c.chainId} | App Expects: 0x${currentChainId.toString(16)}`);
                });
                // ============================

                const hexChainId = `0x${currentChainId.toString(16)}`;
                const supportedChains = config.chains.map(c => c.id);

                console.log(`[Debug] 5. Chain Check: Wallet is on ${currentChainId} (${hexChainId}). App supports: ${supportedChains.join(', ')}`);

                if (!supportedChains.includes(currentChainId)) {
                    console.error("🚨 CRITICAL: Wallet chain ID not supported by App Config!");
                }

                if (!accounts || accounts.length === 0) {
                    const chainHex = `0x${currentChainId.toString(16)}`;
                    throw new Error(`XO Connect: No accounts found for chain ID ${currentChainId} (${chainHex}). Verify your wallet supports this network.`);
                }

                const result = {
                    accounts: accounts as readonly `0x${string}`[],
                    chainId: currentChainId,
                };
                console.log("[Debug] 6. Returning to Wagmi:", result);
                return result as any;
            } catch (error) {
                console.error("[xoConnector] ❌ Connection error:", error);
                throw error;
            }
        },

        async getProvider() {
            // Singleton pattern: Only create the provider once
            if (!providerInstance) {
                try {
                    const mod = await import('xo-connect');
                    const XOConnectProvider = mod.XOConnectProvider;

                    const chains = config.chains;
                    // Default to the first chain in your config, or the requested one
                    const initialChain = defaultChain;
                    const initialHexId = `0x${initialChain.id.toString(16)}`;

                    console.log("[xoConnector] Initializing with Chain:", initialChain.name, initialHexId);



                    providerInstance = new XOConnectProvider({
                        rpcs: getRpcMap(chains),
                        defaultChainId: initialHexId,
                    });
                } catch (e) {
                    console.error("[xoConnector] ❌ Failed to import/init xo-connect:", e);
                    throw e;
                }
            }
            return providerInstance;
        },

        async getAccounts() {
            const provider = await this.getProvider();
            const accounts = await (provider as any).request({ method: 'eth_accounts' });
            return accounts as readonly `0x${string}`[];
        },

        async getChainId() {
            const provider = await this.getProvider();
            const hexId = await (provider as any).request({ method: 'eth_chainId' });
            return parseInt(hexId, 16);
        },

        async isAuthorized() {
            try {
                const accounts = await this.getAccounts();
                console.log("[Debug] isAuthorized check. Accounts found:", accounts.length);
                return !!accounts.length;
            } catch {
                return false;
            }
        },

        async disconnect() {
            // XOConnect handles disconnects internally via window events,
            // but we can ensure local state is cleared if needed.
        },

        onAccountsChanged(accounts) {
            config.emitter.emit('change', { accounts: accounts as readonly `0x${string}`[] });
        },

        onChainChanged(chain) {
            const chainId = parseInt(chain, 16);
            config.emitter.emit('change', { chainId });
        },

        onDisconnect() {
            config.emitter.emit('disconnect');
        },
    }));
}
