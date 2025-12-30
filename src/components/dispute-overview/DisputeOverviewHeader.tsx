"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisputeOverviewHeaderProps {
  onBack: () => void;
  title?: string;
  className?: string;
}

export const DisputeOverviewHeader: React.FC<DisputeOverviewHeaderProps> = ({
  onBack,
  title,
  className,
}) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        "w-full pt-9 px-6 pb-2 flex items-center justify-between relative z-10",
        className,
      )}
    >
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-[#1b1c23]"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {title && (
        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
          {title}
        </span>
      )}

      <button
        onClick={() => router.push("/disputes")}
        className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-[#1b1c23]"
      >
        <Home className="w-5 h-5" />
      </button>
    </div>
  );
};
