"use client";

import React, { useState } from "react";
import { useXOContracts } from "@/providers/XOContractsProvider";
import { toast } from "sonner";
import { Loader2, Copy, Check, Wallet, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const XOConnectButton = () => {
  const { connect, address } = useXOContracts();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 5)}...${address.slice(-4)}`
    : "";

  // 1. Connected State
  if (address) {
    return (
      <div className="flex items-center gap-3">
        {/* Notification Bell Button */}
        <Button
          size="icon"
          className="h-11 w-11 rounded-2xl bg-[#1b1c23] text-white hover:bg-[#2c2d33] shadow-md border-0"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* Address Button */}
        <div className="relative group inline-block">
          <Button
            variant="outline"
            className="h-11 gap-3 rounded-2xl border-gray-200 bg-white px-5 text-[#1b1c23] shadow-md hover:bg-gray-50 hover:text-[#1b1c23]"
          >
            {/* Green Status Dot */}
            <div className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>

            <span className="font-manrope text-sm font-extrabold tracking-tight">
              {shortAddress}
            </span>
          </Button>

          {/* Hover Card / Popover */}
          <div className="absolute right-0 top-full z-50 mt-2 w-72 translate-y-2 opacity-0 invisible transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-hover:visible">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-popover-foreground shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-manrope text-sm font-bold text-[#1b1c23]">
                    Wallet Connected
                  </h4>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-600">
                    Active
                  </span>
                </div>

                <div className="break-all rounded-xl border border-gray-100 bg-gray-50 p-3 font-mono text-xs text-gray-600">
                  {address}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 w-full justify-center rounded-xl bg-[#1b1c23] text-white hover:bg-[#2c2d33]"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3.5 w-3.5" /> Copy Address
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Disconnected State
  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className="h-11 rounded-2xl bg-[#1b1c23] px-6 text-base font-bold text-white shadow-lg hover:bg-[#2c2d33]"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Login
        </>
      )}
    </Button>
  );
};

export default XOConnectButton;
