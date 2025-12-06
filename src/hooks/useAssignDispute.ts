import { useState } from "react";
import { useSliceContract } from "./useSliceContract";
import { useXOContracts } from "@/providers/XOContractsProvider";
import { parseEther } from "ethers"; // ethers v6 top-level import
import { toast } from "sonner";

export function useAssignDispute() {
  const [isLoading, setIsLoading] = useState(false);
  const contract = useSliceContract();
  const { address } = useXOContracts();

  const assignDispute = async (category: string, stakeAmount: bigint) => {
    if (!contract || !address) {
      toast.error("Wallet not connected");
      return null;
    }

    setIsLoading(true);

    try {
      // 1. "Matchmaking": Find a dispute to join.
      // For this demo, we simply try to join the most recently created dispute.
      const count = await contract.disputeCount();

      if (Number(count) === 0) {
        toast.error("No disputes available to join");
        setIsLoading(false);
        return null;
      }

      const latestDisputeId = count; // IDs usually 1-based or 0-based depending on contract logic

      console.log(
        `Attempting to join dispute #${latestDisputeId} with ${stakeAmount} ETH stake`,
      );

      // 2. Send Transaction (Payable)
      // We convert the stake amount to a string for parseEther.
      // Assuming 'stakeAmount' from UI is in full units (e.g. "20" MATIC), not Wei.
      const ethAmount = stakeAmount.toString();

      // In Ethers v6, overrides like { value } are passed as the last argument
      const tx = await contract.joinDispute(latestDisputeId, {
        value: parseEther(ethAmount),
      });

      toast.info("Staking transaction sent...");

      // 3. Wait for confirmation
      const receipt = await tx.wait();
      console.log("Joined successfully:", receipt);

      toast.success(`Successfully joined Dispute #${latestDisputeId}!`);

      // 4. Return format expected by the UI: [disputeId, jurorAddress]
      return [latestDisputeId, address];
    } catch (error: any) {
      console.error("Error joining dispute:", error);

      // Handle common Reverts (e.g. "Already joined", "Wrong status")
      if (error.message.includes("revert")) {
        toast.error(
          "Transaction reverted. You may have already joined or the dispute is closed.",
        );
      } else {
        toast.error("Failed to assign dispute");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { assignDispute, isLoading };
}
