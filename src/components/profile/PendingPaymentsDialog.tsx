"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { AlertCircle, ArrowRight, Coins } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMyDisputes } from "@/hooks/useMyDisputes";
import { Button } from "@/components/ui/button";

export const PendingPaymentsDialog = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { disputes, isLoading } = useMyDisputes();

  // Filter Logic:
  // 1. Dispute is in 'Created' status (0)
  // 2. User is a party (Claimer or Defender)
  // 3. That specific party role has NOT paid yet
  const pendingDisputes = useMemo(() => {
    if (!address) return [];

    return disputes.filter((d) => {
      // Must be in Created status (waiting for funds)
      if (d.status !== 0) return false;

      const isClaimer = d.claimer.toLowerCase() === address.toLowerCase();
      const isDefender = d.defender.toLowerCase() === address.toLowerCase();

      if (isClaimer && !d.claimerPaid) return true;
      if (isDefender && !d.defenderPaid) return true;

      return false;
    });
  }, [disputes, address]);

  if (isLoading) return null; // Don't show anything while loading
  if (pendingDisputes.length === 0) return null; // Hide if no actions needed

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full py-6 rounded-2xl flex items-center justify-between px-5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-sm mb-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-white transition-colors">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-extrabold text-red-700">
                Action Required
              </span>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                {pendingDisputes.length} Payment
                {pendingDisputes.length !== 1 ? "s" : ""} Pending
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-red-500" />
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] rounded-[32px] p-0 overflow-hidden bg-[#F8F9FC] border-none">
        <div className="p-6 bg-white pb-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-extrabold text-[#1b1c23] flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#8c8fff]" />
              Pending Payments
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {pendingDisputes.map((dispute) => (
              <button
                key={dispute.id}
                onClick={() => router.push(`/pay/${dispute.id}`)}
                className="w-full bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-[#8c8fff] transition-all flex items-center justify-between group text-left"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500">
                      #{dispute.id}
                    </span>
                    <span className="text-[10px] font-bold text-[#8c8fff] uppercase tracking-wider truncate">
                      {dispute.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#1b1c23] truncate">
                    {dispute.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Stake required:{" "}
                    <span className="text-[#1b1c23] font-bold">
                      {dispute.stake} USDC
                    </span>
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#1b1c23] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#F8F9FC] p-4 text-center">
          <p className="text-[10px] text-gray-400 font-medium">
            Disputes cannot proceed until all parties have paid.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
