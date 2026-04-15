"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function ImagePreview({ images = [], className = "" }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  if (safeImages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-40 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.08] ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-xs text-muted-foreground font-medium">No images</p>
        </div>
      </div>
    );
  }

  const prev = () => setSelectedIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
  const next = () => setSelectedIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className={className}>
        <div className="relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.08] mb-2 group">
          <img
            src={safeImages[selectedIndex]}
            alt={`Product image ${selectedIndex + 1}`}
            className="w-full h-56 sm:h-64 object-cover"
          />
          <button
            onClick={() => setLightbox(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all cursor-zoom-in"
          >
            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </button>
          {safeImages.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center shadow-md hover:bg-white cursor-pointer transition-colors">
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center shadow-md hover:bg-white cursor-pointer transition-colors">
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </>
          )}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            {selectedIndex + 1} / {safeImages.length}
          </div>
        </div>
        {safeImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {safeImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`relative shrink-0 h-14 w-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  i === selectedIndex ? "border-[#0F69B0] shadow-md shadow-[#0F69B0]/20" : "border-transparent hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                <img src={img} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            {safeImages.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={safeImages[selectedIndex]}
              alt="Full size"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}