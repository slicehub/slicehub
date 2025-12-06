import { BrowserProvider, JsonRpcSigner } from "ethers";
import { type WalletClient } from "viem";

/**
 * Converts a Viem Wallet Client (from Wagmi) to an Ethers.js Signer.
 */
export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  if (!account || !chain || !transport) {
    throw new Error("Invalid wallet client");
  }

  const network = {
    chainId: chain?.id,
    name: chain?.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };

  // Create a BrowserProvider using the Viem transport
  const provider = new BrowserProvider(transport, network);

  // Create a Signer from the provider
  const signer = new JsonRpcSigner(provider, account.address);

  return signer;
}
