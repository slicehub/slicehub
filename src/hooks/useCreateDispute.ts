import { useState } from "react";
import { useSliceContract } from "./useSliceContract";
import { toast } from "sonner";

export function useCreateDispute() {
  const [isCreating, setIsCreating] = useState(false);
  const contract = useSliceContract();

  const createDispute = async (
    defenderAddress: string,
    category: string,
    jurorsRequired: number = 3,
  ) => {
    if (!contract) {
      toast.error("Wallet not connected");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Call the contract function
      // Note: ethers v6 auto-converts JS numbers to BigInt for uint256 if they are small enough,
      // but BigInt(...) is safer for large numbers or IDs.
      const tx = await contract.createDispute(
        defenderAddress,
        category,
        BigInt(jurorsRequired),
        BigInt(3600), // paySeconds
        BigInt(3600), // commitSeconds
        BigInt(3600), // revealSeconds
      );

      console.log("Transaction sent:", tx.hash);
      toast.info("Transaction sent. Waiting for confirmation...");

      // 2. Wait for the transaction to be mined
      const receipt = await tx.wait();

      console.log("Transaction confirmed:", receipt);
      toast.success("Dispute created successfully!");

      // Optional: Parse logs to get the new Dispute ID if needed
      // (Ethers v6 automatically parses logs in the receipt if ABI is known)
    } catch (error) {
      console.error("Error creating dispute:", error);
      toast.error("Failed to create dispute");
    } finally {
      setIsCreating(false);
    }
  };

  return { createDispute, isCreating };
}
