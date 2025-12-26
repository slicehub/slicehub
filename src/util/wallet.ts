import { isAddress } from "viem";

/**
 * Shortens a wallet address to the format 0x1234...5678
 * @param address The full wallet address (or any string)
 * @param chars Number of characters to show at start and end (default 4)
 * @returns Shortened address or original string if not a valid address format
 */
export const shortenAddress = (
  address: string | undefined,
  chars = 4,
): string => {
  if (!address) return "";

  // Use Viem to validate it's a real Ethereum address
  if (!isAddress(address)) {
    // Fallback logic for non-address strings (like names)
    return address.length > 20
      ? `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`
      : address;
  }

  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};
