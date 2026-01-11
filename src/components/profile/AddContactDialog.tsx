"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UserPlus, Check, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AVAILABLE_AVATARS } from "@/config/contacts";
import { useAddressBook } from "@/hooks/useAddressBook";
import { cn } from "@/lib/utils";

export function AddContactDialog({
  variant = "grid",
}: {
  variant?: "grid" | "full";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { addContact } = useAddressBook();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVAILABLE_AVATARS[0]);

  const handleSave = () => {
    if (!name || !address) return;
    addContact(name, address, selectedAvatar);
    setIsOpen(false);
    // Reset form
    setName("");
    setAddress("");
    setSelectedAvatar(AVAILABLE_AVATARS[0]);
  };

  const isValidAddress = address.startsWith("0x") && address.length === 42;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "full" ? (
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center justify-center gap-3 rounded-2xl bg-[#1b1c23] text-white hover:bg-gray-800 border-none shadow-lg transition-all group"
          >
            <UserPlus className="w-5 h-5" />
            <span className="text-sm font-bold">Add New Contact</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1 h-auto py-4 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#8c8fff] hover:bg-blue-50/50 transition-all group bg-white"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600">
              Add Contact
            </span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-[#1b1c23]">
            New Contact
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-4">
          {/* 1. Inputs (Moved to Top) */}
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Alias Name
              </label>
              <input
                className="w-full p-3 bg-gray-50 rounded-xl font-bold text-[#1b1c23] outline-none focus:ring-2 focus:ring-[#8c8fff]/20 border border-gray-100 focus:border-[#8c8fff]"
                placeholder="e.g. Alice (DAO)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Wallet Address
              </label>
              <input
                className={cn(
                  "w-full p-3 bg-gray-50 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-[#8c8fff]/20 border transition-colors",
                  address && !isValidAddress
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-100 focus:border-[#8c8fff]",
                )}
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {address && !isValidAddress && (
                <p className="text-xs text-red-500 mt-1">
                  Please enter a valid 42-character address
                </p>
              )}
            </div>
          </div>

          {/* 2. Avatar Selection (Moved to Bottom) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Choose Avatar
            </label>
            {/* UPDATED: 4 Columns Grid */}
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_AVATARS.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelectedAvatar(src)}
                  className={cn(
                    "relative w-full aspect-square rounded-xl shrink-0 border-2 transition-all overflow-hidden",
                    selectedAvatar === src
                      ? "border-[#8c8fff] scale-105 z-10 shadow-md"
                      : "border-transparent opacity-50 hover:opacity-100 bg-gray-50",
                  )}
                >
                  <Image
                    src={src}
                    alt="Avatar option"
                    fill
                    className="object-cover"
                  />
                  {selectedAvatar === src && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!name || !isValidAddress}
            className="w-full py-6 rounded-xl font-bold bg-[#1b1c23] text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
