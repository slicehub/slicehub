"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldAlert,
  Gavel,
  CreditCard,
  Trophy,
  ChevronRight,
  RefreshCw,
  Hash,
} from "lucide-react";
import ConnectButton from "@/components/ConnectButton";
import { useSliceContract } from "@/hooks/useSliceContract";

export default function ProfilePage() {
  const router = useRouter();
  // const { address } = useXOContracts();
  const contract = useSliceContract();

  // State for the "Test Tools" input
  const [targetDisputeId, setTargetDisputeId] = useState("");
  const [latestDisputeId, setLatestDisputeId] = useState<number | null>(null);
  const [loadingLatest, setLoadingLatest] = useState(false);

  // Fetch the latest dispute count when contract is ready
  const fetchLatestId = useCallback(async () => {
    if (!contract) return;
    setLoadingLatest(true);
    try {
      const count = await contract.disputeCount();
      setLatestDisputeId(Number(count));
    } catch (error) {
      console.error("Failed to fetch dispute count", error);
    } finally {
      setLoadingLatest(false);
    }
  }, [contract]); // 3. Add dependencies 'contract' needs here

  // 4. Now you can safely add it to useEffect
  useEffect(() => {
    void fetchLatestId();
  }, [fetchLatestId]);
  const handleNavigation = (path: string) => {
    if (path.includes("[id]")) {
      if (!targetDisputeId) return;
      router.push(path.replace("[id]", targetDisputeId));
    } else {
      router.push(path);
    }
  };

  const autofillLatest = () => {
    if (latestDisputeId !== null) {
      setTargetDisputeId(latestDisputeId.toString());
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* --- Header --- */}
      <div className="w-full px-5 pt-9 pb-4 flex items-center justify-between bg-white shadow-sm z-10 sticky top-0">
        <button
          onClick={() => router.push("/disputes")}
          className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1b1c23]" />
        </button>
        <span className="font-manrope font-extrabold text-lg text-[#1b1c23]">
          Profile
        </span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        {/* --- Profile Card --- */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#f5f6f9] overflow-hidden border-4 border-white shadow-lg">
              <img
                src="/images/profiles-mockup/profile-1.png"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
                }}
              />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#8c8fff] rounded-full border-2 border-white flex items-center justify-center">
              <Trophy className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <h2 className="font-manrope font-extrabold text-xl text-[#1b1c23]">
              Welcome Back
            </h2>
            <div className="scale-90">
              <ConnectButton />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <div className="bg-[#f5f6f9] p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Rank
              </span>
              <span className="text-lg font-extrabold text-[#1b1c23]">
                Justice Lvl 5
              </span>
            </div>
            <div className="bg-[#f5f6f9] p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Earnings
              </span>
              <span className="text-lg font-extrabold text-[#1b1c23]">
                $1,240
              </span>
            </div>
          </div>
        </div>

        {/* --- Main Actions --- */}
        <div className="flex flex-col gap-3">
          <h3 className="font-manrope font-bold text-sm text-gray-400 uppercase tracking-wider ml-1">
            Actions
          </h3>

          <button
            onClick={() => router.push("/create")}
            className="group w-full bg-white p-4 rounded-[18px] border border-gray-100 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1b1c23] flex items-center justify-center group-hover:shadow-lg transition-all">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-[#1b1c23]">Create Dispute</span>
                <span className="text-xs text-gray-500">
                  Start a new case on-chain
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* --- Testing Tools Zone --- */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center ml-1">
            <h3 className="font-manrope font-bold text-sm text-[#8c8fff] uppercase tracking-wider flex items-center gap-2">
              Dev Tools{" "}
              <span className="bg-[#8c8fff]/10 text-[#8c8fff] text-[10px] px-2 py-0.5 rounded-full">
                TESTNET
              </span>
            </h3>
            <button
              onClick={() => void fetchLatestId()}
              disabled={loadingLatest}
              className="text-[#8c8fff] hover:bg-[#8c8fff]/10 p-1 rounded-full transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingLatest ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-sm flex flex-col gap-4">
            {/* Latest Dispute Info Box */}
            {latestDisputeId !== null && (
              <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">
                    Latest Created
                  </span>
                  <span className="text-sm font-bold text-[#0c4a6e]">
                    Dispute #{latestDisputeId}
                  </span>
                </div>
                <button
                  onClick={autofillLatest}
                  className="px-3 py-1.5 bg-[#0ea5e9] text-white text-xs font-bold rounded-lg hover:bg-[#0284c7] transition-colors"
                >
                  Use ID
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#1b1c23] uppercase flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Target Dispute ID
              </label>
              <input
                type="text"
                placeholder="e.g. 1, 2, 42..."
                className="w-full bg-[#f5f6f9] p-3 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8c8fff]"
                value={targetDisputeId}
                onChange={(e) => setTargetDisputeId(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleNavigation("/pay/[id]")}
                disabled={!targetDisputeId}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#8c8fff] hover:bg-[#8c8fff]/5 transition-all disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5 text-[#1b1c23]" />
                <span className="text-xs font-bold text-[#1b1c23]">
                  Go to Pay
                </span>
              </button>

              <button
                onClick={() => handleNavigation("/execute-ruling/[id]")}
                disabled={!targetDisputeId}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#8c8fff] hover:bg-[#8c8fff]/5 transition-all disabled:opacity-50"
              >
                <Gavel className="w-5 h-5 text-[#1b1c23]" />
                <span className="text-xs font-bold text-[#1b1c23]">
                  Execute Ruling
                </span>
              </button>
            </div>

            <button
              onClick={() => handleNavigation("/reveal/[id]")}
              disabled={!targetDisputeId}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-xs font-bold hover:border-[#8c8fff] hover:text-[#8c8fff] transition-colors disabled:opacity-50"
            >
              DEBUG: FORCE REVEAL PAGE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
