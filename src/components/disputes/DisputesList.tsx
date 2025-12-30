"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { DisputeListView } from "./DisputeListView";
import { useAccount } from "wagmi";
import ConnectButton from "../ConnectButton";
import { useAllDisputes } from "@/hooks/useAllDisputes";

export const DisputesList: React.FC = () => {
  const router = useRouter();
  const { isConnected } = useAccount();

  // Use "juror" to strictly get disputes where I am a juror.
  // Use activeOnly: true to hide finished disputes.
  const { disputes, isLoading } = useAllDisputes();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
        <h3 className="text-lg font-bold text-[#1b1c23] mb-2">
          Connect to see your cases
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          You need to connect your wallet to view your active disputes.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <DisputeListView
      disputes={disputes}
      isLoading={isLoading}
      onEarnClick={() => router.push("/category-amount")}
    />
  );
};
