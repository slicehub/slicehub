"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useAssignDispute } from "@/hooks/useAssignDispute";
import { useGetDispute } from "@/hooks/useGetDispute";
import {
  Loader2,
  ShieldCheck,
  ArrowRight,
  Target,
  Coins,
  Scale,
} from "lucide-react";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";

export default function JoinDisputePage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = Number(params?.id);

  // 1. Fetch details
  const { dispute, loading: isLoadingDispute } = useGetDispute(
    disputeId.toString(),
  );

  // Helper to format the stake (already formatted in DisputeUI)
  const stakeDisplay = React.useMemo(() => {
    return dispute?.stake || null;
  }, [dispute]);

  // 2. Hook to execute the join
  const { joinDispute, isLoading: isJoining } = useAssignDispute();

  const handleConfirm = async () => {
    const success = await joinDispute(disputeId);
    if (success) {
      router.push(`/loading-disputes/${disputeId}`);
    }
  };

  if (isLoadingDispute) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8c8fff]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FC] relative overflow-hidden">
      {/* --- Ambient Background Glow (Purple) --- */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#8c8fff]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-4 z-10">
        <DisputeOverviewHeader onBack={() => router.back()} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 animate-in fade-in zoom-in-95 duration-500 pb-20">
        {/* Main Card */}
        <div className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(27,28,35,0.08)] border border-white relative">
          {/* Status Badge */}
          <div className="absolute top-6 right-6">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Open Case
            </span>
          </div>

          {/* Hero Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-[#F8F9FC] rounded-full flex items-center justify-center relative group">
              <div className="absolute inset-0 border border-[#8c8fff]/20 rounded-full scale-100 group-hover:scale-110 transition-transform duration-500" />
              <div className="w-20 h-20 bg-[#8c8fff] rounded-full flex items-center justify-center shadow-lg shadow-[#8c8fff]/30">
                <Scale className="w-10 h-10 text-white" />
              </div>

              {/* Floating Checkmark Badge */}
              <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm">
                <div className="bg-[#1b1c23] w-6 h-6 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-manrope font-extrabold text-[#1b1c23] mb-2 tracking-tight">
              You've been selected
            </h2>
            <p className="text-base text-gray-500 font-medium leading-relaxed max-w-[260px] mx-auto">
              Your expertise is requested for{" "}
              <span className="text-[#1b1c23] font-bold">
                Dispute #{disputeId}
              </span>
              .
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* Category Box */}
            <div className="bg-[#F8F9FC] border border-gray-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-[#8c8fff]/30 transition-colors">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Target className="w-3 h-3" /> Area
              </span>
              <span className="text-sm font-bold text-gray-800 text-center">
                {dispute?.category || "General"}
              </span>
            </div>

            {/* Role Box */}
            <div className="bg-[#F8F9FC] border border-gray-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-[#8c8fff]/30 transition-colors">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Role
              </span>
              <span className="text-sm font-bold text-gray-800">Juror</span>
            </div>
          </div>

          {/* Stake Section - The "Hook" */}
          <div className="border-t border-dashed border-gray-200 pt-6 mb-8 text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-2">
              <Coins className="w-3.5 h-3.5" /> Required Stake
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl font-manrope font-black text-[#8c8fff] tracking-tighter drop-shadow-sm">
                {stakeDisplay || "0"}
              </span>
              <span className="text-xl font-bold text-gray-600">USDC</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleConfirm}
            disabled={isJoining}
            className="w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-manrope font-bold text-base tracking-wide hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Securing Seat...
              </>
            ) : (
              <>
                Confirm & Join
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Trust Footer */}
        <p className="mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" /> Secured by Slice Protocol
        </p>
      </div>
    </div>
  );
}
