"use client";

import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div
        className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(15,105,176,0.08)" }}
      >
        {Icon && <Icon className="h-8 w-8 text-[#0F69B0]/60" />}
      </div>
      <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground font-medium max-w-sm mb-6">
        {description}
      </p>
      {action && action}
    </motion.div>
  );
}