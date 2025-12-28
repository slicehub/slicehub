"use client";

import React, { useState } from "react";
import { useCreateDispute } from "@/hooks/useCreateDispute";
import { uploadFileToIPFS } from "@/util/ipfs";
import {
  Loader2,
  UploadCloud,
  ShieldAlert,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateDisputePage() {
  const router = useRouter();
  const { createDispute, isCreating } = useCreateDispute();
  // 2. Initialize client
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [claimerName, setClaimerName] = useState("");
  const [defenderName, setDefenderName] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [defenderAddress, setDefenderAddress] = useState("");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [jurorsRequired, setJurorsRequired] = useState(3);

  // Claimant Evidence
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [carouselFiles, setCarouselFiles] = useState<File[]>([]);

  // NEW: Defender Evidence
  const [defDescription, setDefDescription] = useState("");
  const [defAudioFile, setDefAudioFile] = useState<File | null>(null);
  const [defCarouselFiles, setDefCarouselFiles] = useState<File[]>([]);

  // Handlers - Claimant
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAudioFile(e.target.files[0]);
  };

  const handleCarouselChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setCarouselFiles(Array.from(e.target.files));
  };

  // Handlers - Defender
  const handleDefAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setDefAudioFile(e.target.files[0]);
  };
  const handleDefCarouselChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setDefCarouselFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !defenderAddress) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (jurorsRequired % 2 === 0) {
      toast.error("Please select an odd number of jurors to prevent ties.");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload Claimant Assets
      let audioUrl = "";
      if (audioFile) {
        toast.info("Uploading claimant audio...");
        const hash = await uploadFileToIPFS(audioFile);
        if (hash) audioUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
      }

      let carouselUrls: string[] = [];
      if (carouselFiles.length > 0) {
        toast.info("Uploading claimant photos...");
        const uploadPromises = carouselFiles.map((f) => uploadFileToIPFS(f));
        const hashes = await Promise.all(uploadPromises);
        carouselUrls = hashes
          .filter((h) => h)
          .map((h) => `https://gateway.pinata.cloud/ipfs/${h}`);
      }

      // 2. Upload Defender Assets (NEW)
      let defAudioUrl: string | null = null;
      if (defAudioFile) {
        toast.info("Uploading defender audio...");
        const hash = await uploadFileToIPFS(defAudioFile);
        if (hash) defAudioUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
      }

      let defCarouselUrls: string[] = [];
      if (defCarouselFiles.length > 0) {
        toast.info("Uploading defender photos...");
        const hashes = await Promise.all(
          defCarouselFiles.map((f) => uploadFileToIPFS(f)),
        );
        defCarouselUrls = hashes
          .filter((h) => h)
          .map((h) => `https://gateway.pinata.cloud/ipfs/${h}`);
      }

      const disputeData = {
        title,
        description,
        category,
        evidence: evidenceLink ? [evidenceLink] : [],
        aliases: {
          claimer: claimerName || "Anonymous Claimant",
          defender: defenderName || "Anonymous Defendant",
        },
        // Claimant Data
        audioEvidence: audioUrl || null,
        carouselEvidence: carouselUrls,

        // Defender Data (NEW FIELDS)
        defenderDescription: defDescription || null,
        defenderAudioEvidence: defAudioUrl,
        defenderCarouselEvidence: defCarouselUrls,

        created_at: new Date().toISOString(),
      };

      const success = await createDispute(
        defenderAddress,
        category,
        disputeData,
        jurorsRequired,
      );

      if (success) {
        // 3. Invalidate the 'disputeCount' query so Profile page refetches instantly
        await queryClient.invalidateQueries({ queryKey: ["disputeCount"] });
        router.push("/profile");
      }
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Failed to upload evidence.");
    } finally {
      setIsUploading(false);
    }
  };

  const isProcessing = isCreating || isUploading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pb-[90px]">
      <div className="flex items-center gap-4 mb-6 mt-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#1b1c23]" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1b1c23]">
            Create Dispute
          </h1>
          <p className="text-sm text-gray-500">
            Initiate a new claim on-chain.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[18px] p-6 shadow-sm border border-gray-100 flex flex-col gap-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[#1b1c23]">
              Dispute Title
            </label>
            <input
              type="text"
              className="p-3 bg-[#f5f6f9] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#8c8fff] outline-none"
              placeholder="e.g. Freelance work not paid"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#1b1c23]">
                Your Name (Alias)
              </label>
              <input
                className="p-3 bg-[#f5f6f9] rounded-xl text-sm outline-none border border-transparent focus:ring-2 focus:ring-[#8c8fff]"
                value={claimerName}
                onChange={(e) => setClaimerName(e.target.value)}
                placeholder="e.g. John Doe"
                disabled={isProcessing}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#1b1c23]">
                Opponent Name
              </label>
              <input
                className="p-3 bg-[#f5f6f9] rounded-xl text-sm outline-none border border-transparent focus:ring-2 focus:ring-[#8c8fff]"
                value={defenderName}
                onChange={(e) => setDefenderName(e.target.value)}
                placeholder="e.g. Jane Smith"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[#1b1c23]">Category</label>
            <select
              className="p-3 bg-[#f5f6f9] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#8c8fff] outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isProcessing}
            >
              <option value="General">General Court</option>
              <option value="Tech">Tech & Software</option>
              <option value="Freelance">Freelance & Services</option>
              <option value="E-Commerce">E-Commerce</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[#1b1c23]">
              Defendant Address
            </label>
            <input
              type="text"
              className="p-3 bg-[#f5f6f9] rounded-xl text-sm font-mono border-none focus:ring-2 focus:ring-[#8c8fff] outline-none"
              placeholder="0x..."
              value={defenderAddress}
              onChange={(e) => setDefenderAddress(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[#1b1c23] flex justify-between">
              <span>Jurors Needed</span>
              <span className="text-[#8c8fff] font-normal text-xs">
                {jurorsRequired} Jurors
              </span>
            </label>
            <div className="flex items-center gap-4 bg-[#f5f6f9] p-3 rounded-xl">
              <Users size={18} className="text-gray-400" />
              <input
                type="range"
                min="1"
                max="11"
                step="2"
                value={jurorsRequired}
                onChange={(e) => setJurorsRequired(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8c8fff]"
                disabled={isProcessing}
              />
            </div>
            <p className="text-xs text-gray-400">
              Odd numbers only to avoid ties (3, 5, 7...).
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[#1b1c23]">Description</label>
            <textarea
              className="p-3 bg-[#f5f6f9] rounded-xl text-sm border-none focus:ring-2 focus:ring-[#8c8fff] outline-none min-h-[120px] resize-none"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[#1b1c23]">
              Evidence Link (Optional)
            </label>
            <div className="flex items-center gap-2 bg-[#f5f6f9] rounded-xl p-3">
              <UploadCloud size={16} className="text-gray-400" />
              <input
                type="text"
                className="bg-transparent text-sm border-none focus:ring-0 outline-none w-full"
                placeholder="https://..."
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* CLAIMANT EVIDENCE */}
          <div className="flex flex-col gap-2 mt-2">
            <h3 className="font-bold text-sm text-[#1b1c23] uppercase tracking-wide">
              Claimant Evidence
            </h3>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#1b1c23] text-sm">
                Voice Statement
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                disabled={isProcessing}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#f5f6f9] file:text-[#1b1c23] hover:file:bg-gray-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#1b1c23] text-sm">
                Additional Photos (Carousel)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleCarouselChange}
                disabled={isProcessing}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#f5f6f9] file:text-[#1b1c23] hover:file:bg-gray-200"
              />
            </div>
          </div>

          {/* DEFENDER EVIDENCE */}
          <div className="flex flex-col gap-2 mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">
              Defender Evidence (Pre-load)
            </h3>

            {/* Defender Statement Input */}
            <div className="flex flex-col gap-2 mb-2">
              <label className="font-semibold text-[#1b1c23] text-sm">
                Defender Statement
              </label>
              <textarea
                className="p-3 bg-white rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 ring-[#8c8fff] resize-none"
                placeholder="Counter-statement from the defendant..."
                value={defDescription}
                onChange={(e) => setDefDescription(e.target.value)}
                rows={3}
                disabled={isProcessing}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#1b1c23] text-sm">
                Defender Voice
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleDefAudioChange}
                disabled={isProcessing}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-[#1b1c23] hover:file:bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#1b1c23] text-sm">
                Defender Photos
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleDefCarouselChange}
                disabled={isProcessing}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-[#1b1c23] hover:file:bg-gray-100"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              type="submit"
              disabled={isProcessing}
              className={`
                w-full py-6 rounded-xl font-manrope font-semibold  tracking-tight
                flex items-center justify-center gap-2 transition-all
                ${isProcessing ? "bg-gray-300" : "bg-[#1b1c23] hover:bg-[#31353b] text-white"}
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading to IPFS & Signing...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  CREATE DISPUTE
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
