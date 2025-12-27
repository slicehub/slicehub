import { createConnector } from 'wagmi';
import { Chain } from 'wagmi/chains';

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
            console.log("[xoConnector] connect() triggered");
            try {
                console.log("[xoConnector] Calling getProvider()...");
                const provider = await this.getProvider();
                console.log("[xoConnector] Provider obtained:", provider);

                console.log("[xoConnector] Requesting accounts...");
                await (provider as any).request({ method: 'eth_requestAccounts' });
                console.log("[xoConnector] Accounts requested.");

                const currentChainId = await this.getChainId();
                const accounts = await this.getAccounts();

                console.log("[xoConnector] Accounts resolved:", accounts);

                if (!accounts || accounts.length === 0) {
                    const chainHex = `0x${currentChainId.toString(16)}`;
                    throw new Error(`XO Connect: No accounts found for chain ID ${currentChainId} (${chainHex}). Verify your wallet supports this network.`);
                }

                return {
                    accounts: accounts as readonly `0x${string}`[],
                    chainId: currentChainId,
                } as any;
            } catch (error) {
                console.error("[xoConnector] ❌ Connection error:", error);
                throw error;
            }
        },

        async getProvider() {
            // Singleton pattern: Only create the provider once
            if (!providerInstance) {
                console.log("[xoConnector] Importing xo-connect library...");
                try {
                    const mod = await import('xo-connect');
                    console.log("[xoConnector] Library imported. Initializing provider...");
                    const XOConnectProvider = mod.XOConnectProvider;

                    const chains = config.chains;
                    // Default to the first chain in your config, or the requested one
                    const initialChain = chains[0];
                    const initialHexId = `0x${initialChain.id.toString(16)}`;

                    console.log("[xoConnector] Initializing with defaultChainId:", initialHexId);

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
