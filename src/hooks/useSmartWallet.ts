import { useAccount, useChainId } from "wagmi";
import { useEmbedded } from "@/providers/EmbeddedProvider";
import { DEFAULT_CHAIN } from "@/config/chains";

export function useSmartWallet() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { isEmbedded } = useEmbedded();

    return {
        address,
        chainId,
        isConnected,
        isWrongNetwork: chainId !== DEFAULT_CHAIN.chain.id,
        isEmbedded
    };
}
