import { createConnector } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { defaultChain } from '@/config/chains';

// Helper to convert BigInts to Hex strings recursively
function sanitizeParams(params: any): any {
    if (typeof params === 'bigint') {
        return `0x${params.toString(16)}`;
    }
    if (Array.isArray(params)) {
        return params.map(sanitizeParams);
    }
    if (typeof params === 'object' && params !== null) {
        const newObj: any = {};
        for (const key in params) {
            newObj[key] = sanitizeParams(params[key]);
        }
        return newObj;
    }
    return params;
}

function getRpcMap(chains: readonly Chain[]) {
    const rpcMap: Record<string, string> = {};
    chains.forEach((chain) => {
        const hexId = `0x${chain.id.toString(16)}`;
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
                const provider = await this.getProvider();
                await (provider as any).request({ method: 'eth_requestAccounts' });

                const currentChainId = await this.getChainId();
                const accounts = await this.getAccounts();

                if (!accounts || accounts.length === 0) {
                    const chainHex = `0x${currentChainId.toString(16)}`;
                    throw new Error(`XO Connect: No accounts found for chain ID ${currentChainId}. (${chainHex})`);
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
            if (!providerInstance) {
                try {
                    const mod = await import('xo-connect');
                    const XOConnectProvider = mod.XOConnectProvider;
                    const initialChain = defaultChain;
                    const initialHexId = `0x${initialChain.id.toString(16)}`;

                    console.log("[xoConnector] Initializing with Chain:", initialChain.name, initialHexId);

                    const rawProvider = new XOConnectProvider({
                        rpcs: getRpcMap(config.chains),
                        defaultChainId: initialHexId,
                    });

                    // === PROXY WRAPPER ===
                    providerInstance = new Proxy(rawProvider, {
                        get(target, prop) {
                            if (prop === 'request') {
                                return async (args: { method: string, params?: any[] }) => {

                                    // 1. Intercept Transaction Calls
                                    if (args.method === 'eth_sendTransaction') {
                                        try {
                                            const originalTx = args.params?.[0] || {};

                                            // A. Sanitize BigInts -> Hex Strings
                                            const cleanTx = sanitizeParams(originalTx);

                                            // B. Map 'gas' to 'gasLimit'
                                            if (cleanTx.gas) {
                                                cleanTx.gasLimit = cleanTx.gas;
                                                delete cleanTx.gas;
                                            }

                                            // C. 🚨 CRITICAL FIX: Force Default Gas Limit if missing
                                            // If the hook didn't provide gas, we inject a high limit (500,000)
                                            // to prevent the wallet from trying to estimate it (which fails).
                                            if (!cleanTx.gasLimit) {
                                                console.warn("[xoConnector] ⚠️ No gas limit found. Injecting default 500k.");
                                                cleanTx.gasLimit = "0x7A120"; // 500,000 in Hex
                                            }

                                            // D. Ensure Value exists
                                            if (!cleanTx.value) {
                                                cleanTx.value = "0x0";
                                            }

                                            console.log("[xoConnector] 🚀 Sending FINAL params to XO:", cleanTx);

                                            // E. Send Request & Catch Errors
                                            return await target.request({
                                                method: args.method,
                                                params: [cleanTx]
                                            });

                                        } catch (innerError) {
                                            console.error("[xoConnector] 💥 Wallet rejected transaction:", innerError);
                                            throw innerError;
                                        }
                                    }

                                    // Pass through other requests normally
                                    return target.request(args);
                                };
                            }
                            return (target as any)[prop];
                        }
                    });

                } catch (e) {
                    console.error("[xoConnector] ❌ Failed to init:", e);
                    throw e;
                }
            }
            return providerInstance;
        },

        async getAccounts() {
            const provider = await this.getProvider();
            return (provider as any).request({ method: 'eth_accounts' });
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
            } catch { return false; }
        },

        async disconnect() { },
        onAccountsChanged(accounts) { config.emitter.emit('change', { accounts: accounts as any }); },
        onChainChanged(chain) { config.emitter.emit('change', { chainId: parseInt(chain, 16) }); },
        onDisconnect() { config.emitter.emit('disconnect'); },
    }));
}