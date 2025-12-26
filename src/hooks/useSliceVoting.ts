import { useState } from "react";
import { toast } from "sonner";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { SLICE_ABI, SLICE_ADDRESS } from "@/config/contracts";
import { calculateCommitment, generateSalt } from "../util/votingUtils";
import { saveVoteData, getVoteData } from "../util/votingStorage";

export const useSliceVoting = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string>("");

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  // --- COMMIT VOTE ---
  const commitVote = async (disputeId: string, vote: number) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return false;
    }

    setIsProcessing(true);
    setLogs("Generating secure commitment...");

    try {
      const salt = generateSalt();
      const commitmentHash = calculateCommitment(vote, salt);

      console.log(`Vote: ${vote}, Salt: ${salt}, Hash: ${commitmentHash}`);
      setLogs("Sending commitment to blockchain...");

      const hash = await writeContractAsync({
        address: SLICE_ADDRESS,
        abi: SLICE_ABI,
        functionName: "commitVote",
        args: [BigInt(disputeId), commitmentHash as `0x${string}`],
      });

      setLogs("Waiting for confirmation...");

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // 3. Use Utility to Save
      saveVoteData(SLICE_ADDRESS, disputeId, address, vote, salt);

      toast.success("Vote committed successfully! Salt saved.");
      setLogs("Commitment confirmed on-chain.");
      return true;
    } catch (error: any) {
      console.error("Commit Error:", error);
      const msg =
        error.reason ||
        error.shortMessage ||
        error.message ||
        "Failed to commit vote";
      toast.error(`Commit Error: ${msg}`);
      setLogs(`Error: ${msg}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // --- REVEAL VOTE ---
  const revealVote = async (disputeId: string) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return false;
    }

    setIsProcessing(true);
    setLogs("Retrieving secret salt...");

    try {
      // 4. Use Utility to Retrieve
      const storedData = getVoteData(SLICE_ADDRESS, disputeId, address);

      if (!storedData) {
        throw new Error(
          "No local vote data found for this dispute deployment.",
        );
      }

      const { vote, salt } = storedData;

      setLogs(`Revealing Vote: ${vote}...`);

      const hash = await writeContractAsync({
        address: SLICE_ADDRESS,
        abi: SLICE_ABI,
        functionName: "revealVote",
        args: [BigInt(disputeId), BigInt(vote), BigInt(salt)],
      });

      setLogs("Waiting for confirmation...");
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      toast.success("Vote revealed successfully!");
      setLogs("Vote revealed and counted.");
      return true;
    } catch (error: any) {
      console.error("Reveal Error:", error);
      const msg =
        error.reason ||
        error.shortMessage ||
        error.message ||
        "Failed to reveal vote";
      toast.error(`Reveal Error: ${msg}`);
      setLogs(`Error: ${msg}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { commitVote, revealVote, isProcessing, logs };
};
