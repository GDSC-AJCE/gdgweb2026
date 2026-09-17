"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, Check } from "lucide-react";
import { uploadCustomImage } from "@/lib/imageUpload";

interface CustomImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  fallbackUrl?: string;
  label?: string;
  description?: string;
  allowUrlToggle?: boolean;
}

export default function CustomImageUploader({
  value,
  onChange,
  folder = "execom",
  fallbackUrl,
  label = "Profile Image",
  description = "Upload a JPG, PNG, or WebP photo (auto-optimized).",
  allowUrlToggle = true,
}: CustomImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = value?.trim() || fallbackUrl || "";

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Please select an image under 10MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const result = await uploadCustomImage(file, folder);
      onChange(result.url);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err?.message || "Failed to process image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono uppercase text-[#80827f] font-semibold block">
          {label}
        </label>
        {allowUrlToggle && (
          <button
            type="button"
            onClick={() => setMode(mode === "file" ? "url" : "file")}
            className="text-[10px] font-mono text-[#2ba0ff] hover:underline flex items-center gap-1 cursor-pointer"
          >
            {mode === "file" ? (
              <>
                <LinkIcon className="w-2.5 h-2.5" />
                <span>Or use image URL</span>
              </>
            ) : (
              <>
                <Upload className="w-2.5 h-2.5" />
                <span>Or upload file</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-start gap-4 p-3 rounded-2xl bg-white border border-[#d5d5d4]">
        {/* AVATAR PREVIEW */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#d5d5d4] bg-[#f5f1e4] flex items-center justify-center shadow-xs">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Profile Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
                    e.currentTarget.src = fallbackUrl;
                  }
                }}
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-[#80827f]" />
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              title="Remove custom photo"
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EA4335] text-white flex items-center justify-center hover:bg-red-700 transition shadow-xs cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="flex-1 min-w-0">
          {mode === "file" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`w-full py-2.5 px-3 rounded-xl border border-dashed transition flex items-center justify-between gap-2 cursor-pointer ${
                  isDragOver
                    ? "border-[#2ba0ff] bg-[#2ba0ff]/5"
                    : "border-[#d5d5d4] hover:border-[#2ba0ff] hover:bg-[#f5f1e4]/50"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 text-[#2ba0ff] animate-spin shrink-0" />
                  ) : (
                    <Upload className="w-4 h-4 text-[#80827f] shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-[#2c2e2a] truncate">
                    {uploading
                      ? "Optimizing & uploading..."
                      : value
                      ? "Replace custom image"
                      : "Choose or drop custom photo"}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-[50px] bg-[#2c2e2a] text-white text-[10px] font-semibold shrink-0">
                  Browse
                </span>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="url"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
              />
            </div>
          )}

          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-[10px] text-[#80827f] truncate">
              {value ? (
                <span className="text-[#34A853] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 inline" /> Custom image attached
                </span>
              ) : fallbackUrl ? (
                "Using default Gmail / Google account photo"
              ) : (
                description
              )}
            </p>
            {value && fallbackUrl && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-[#80827f] hover:text-[#2c2e2a] underline shrink-0 cursor-pointer"
              >
                Use Gmail photo
              </button>
            )}
          </div>
          {error && <p className="text-[10px] text-[#EA4335] mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
