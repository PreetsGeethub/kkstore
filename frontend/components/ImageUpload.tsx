"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/uploadApi";
import { useToast } from "./Toast";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
};

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast({ variant: "error", title: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ variant: "error", title: "Image must be under 5MB" });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (error) {
      showToast({
        variant: "error",
        title: "Upload failed",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-[#E8D8C5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-white/90 text-[#2A1E17] hover:bg-white"
            >
              <X size={12} strokeWidth={2} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1.5 border border-dashed border-[#E8D8C5] text-[#4A4A4A] transition-colors duration-200 hover:border-[#B08D57] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 size={18} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
          ) : (
            <>
              <Upload size={16} strokeWidth={1.5} />
              <span className="text-[9px] uppercase tracking-wide">Upload</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}