"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { User, Coins } from "lucide-react";

import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { SwipeButton } from "@/components/category-amount/SwipeButton";
import { usePayDispute } from "@/hooks/usePayDispute";
import { useGetDispute } from "@/hooks/useGetDispute";

export default function PayDisputePage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const { payDispute, isPaying } = usePayDispute();
  const { dispute, refetch } = useGetDispute(disputeId);
  const { address } = useAccount();

  // State to hold the formatted USDC value
  const [stakeAmountDisplay, setStakeAmountDisplay] =
    useState<string>("Loading...");

  useEffect(() => {
    if (dispute) {
      // 1. Check Status: If status > 0 (Created), payment is already done
      if (dispute.status > 0) {
        router.replace("/profile");
        return;
      }

      // 2. Format the required stake from units (6 decimals) to USDC (String)
      if (dispute.stake) {
        setStakeAmountDisplay(dispute.stake);
      }
    }
  }, [dispute, disputeId, router]);

  const handleBack = () => {
    router.back();
  };

  const handleSwipeComplete = async () => {
    if (!dispute) return;
    const success = await payDispute(disputeId, stakeAmountDisplay);

    if (success) {
      refetch(); // Refresh local state
      router.push("/profile");
    }
  };

  // Helper to determine role
  const userRole =
    dispute?.claimer?.toLowerCase() === address?.toLowerCase()
      ? "Claimer"
      : dispute?.defender?.toLowerCase() === address?.toLowerCase()
        ? "Defender"
        : "Observer";

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FC] relative overflow-hidden font-manrope">
      {/* --- Ambient Background Glow --- */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#8c8fff]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-4 pt-2 z-10 flex-none">
        <DisputeOverviewHeader onBack={handleBack} />
      </div>

      {/* Main Centered Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-40 z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(27,28,35,0.08)] border border-white relative text-center">
          {/* Hero Animation */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-[#F8F9FC] rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#8c8fff]/10 rounded-full blur-xl scale-75" />
              <video
                src="/animations/money.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover relative z-10 scale-90"
              />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#1b1c23] mb-2 tracking-tight">
            Fund Dispute #{disputeId}
          </h1>

          {/* Details Box */}
          <div className="bg-[#F8F9FC] rounded-2xl p-5 w-full mb-6 border border-gray-100/50">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200/50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Your Role
              </span>
              <span className="text-sm text-[#1b1c23] font-bold">
                {userRole}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" /> Required Stake
              </span>
              <span className="text-lg text-[#8c8fff] font-black">
                {stakeAmountDisplay} USDC
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[260px] mx-auto">
            Both parties must deposit the required stake for the dispute to
            proceed to the voting phase.
          </p>
        </div>
      </div>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-2 pb-8 pt-6 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC] to-transparent">
        {/* Swipe Button */}
        <div className="mt-2">
          {isPaying ? (
            <div className="w-[192px] h-10 bg-[#1b1c23] text-white rounded-[14px] font-bold text-xs flex items-center justify-center gap-2 shadow-lg animate-pulse">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <SwipeButton onSwipeComplete={() => void handleSwipeComplete()}>
              Fund {stakeAmountDisplay} USDC
            </SwipeButton>
          )}
        </div>
      </div>
    </div>
  );
}
