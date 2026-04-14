"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileUpload({ value, onChange, accept = "image/*", label = "Upload Image", className }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/[0.08] group">
          <img src={value} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
            dragging
              ? "border-[#0F69B0] bg-[#0F69B0]/5"
              : "border-gray-200 dark:border-white/[0.1] hover:border-[#0F69B0]/40 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
          )}
        >
          <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs font-bold text-foreground mb-1">{label}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Drag & drop or click to browse</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}