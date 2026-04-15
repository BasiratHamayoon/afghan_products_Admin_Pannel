"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ZoomIn, ChevronLeft, ChevronRight,
  CheckCircle, Clock, FileText, Image, Download,
} from "lucide-react";
import { documentTypeLabels } from "@/data/dummyVerifications";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export default function DocumentViewer({ documents = [], onVerifyDocument, verificationId }) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [lightbox, setLightbox] = useState(false);

  const safeDocuments = Array.isArray(documents) ? documents.filter(Boolean) : [];

  const openLightbox = (doc) => {
    setSelectedDoc(doc);
    setLightbox(true);
  };

  const closeLightbox = () => {
    setLightbox(false);
    setTimeout(() => setSelectedDoc(null), 300);
  };

  const navDoc = (dir) => {
    const idx = safeDocuments.findIndex((d) => d.id === selectedDoc?.id);
    const next = dir === "next"
      ? safeDocuments[(idx + 1) % safeDocuments.length]
      : safeDocuments[(idx - 1 + safeDocuments.length) % safeDocuments.length];
    setSelectedDoc(next);
  };

  if (safeDocuments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-bold text-foreground mb-1">No documents</p>
        <p className="text-xs text-muted-foreground font-medium">No documents have been submitted yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {safeDocuments.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              "rounded-2xl border overflow-hidden transition-all",
              doc.verified
                ? "border-green-200 dark:border-green-800/40"
                : "border-gray-100 dark:border-white/[0.06]"
            )}
          >
            <div
              className="relative h-44 bg-gray-50 dark:bg-white/[0.03] cursor-zoom-in group overflow-hidden"
              onClick={() => openLightbox(doc)}
            >
              <img
                src={doc.url}
                alt={doc.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
              {doc.verified && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-black shadow-lg">
                  <CheckCircle className="h-3 w-3 fill-white" />
                  Verified
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/50 text-white text-[10px] font-bold">
                {doc.format} · {doc.size}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#0f1420]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-xs font-black text-foreground truncate">{doc.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {documentTypeLabels[doc.type] || doc.type}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    Uploaded {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <div
                  className={cn(
                    "shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                    doc.verified
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                      : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                  )}
                >
                  {doc.verified ? (
                    <><CheckCircle className="h-2.5 w-2.5" /> Verified</>
                  ) : (
                    <><Clock className="h-2.5 w-2.5" /> Pending</>
                  )}
                </div>
              </div>

              {onVerifyDocument && (
                <button
                  onClick={() => onVerifyDocument(verificationId, doc.id)}
                  className={cn(
                    "w-full py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer",
                    doc.verified
                      ? "bg-gray-50 dark:bg-white/[0.04] text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
                      : "bg-[#0F69B0]/8 text-[#0F69B0] hover:bg-[#0F69B0]/15"
                  )}
                >
                  {doc.verified ? "Mark as Unverified" : "Mark as Verified"}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {safeDocuments.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navDoc("prev"); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-colors z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navDoc("next"); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-colors z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="text-center z-10" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={selectedDoc.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                src={selectedDoc.url}
                alt={selectedDoc.name}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="mt-4 flex items-center justify-center gap-4">
                <div>
                  <p className="text-sm font-bold text-white">{selectedDoc.name}</p>
                  <p className="text-xs text-white/60 font-medium mt-0.5">
                    {documentTypeLabels[selectedDoc.type] || selectedDoc.type} · {selectedDoc.format} · {selectedDoc.size}
                  </p>
                </div>
                {selectedDoc.verified && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              {safeDocuments.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {safeDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={cn(
                        "h-12 w-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                        doc.id === selectedDoc.id ? "border-white" : "border-white/20 hover:border-white/50"
                      )}
                    >
                      <img src={doc.url} alt={doc.name} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}