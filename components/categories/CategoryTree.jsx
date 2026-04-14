"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Edit2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { dummyCategories, dummySubCategories } from "@/data/dummyCategories";

function TreeNode({ category, level = 0, onEdit, onAdd }) {
  const [expanded, setExpanded] = useState(level === 0);

  if (!category || !category.id) return null;

  const allItems = [...(dummyCategories || []), ...(dummySubCategories || [])];
  const children = allItems.filter((c) => c && c.parentId === category.id);
  const hasChildren = children.length > 0;

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer group transition-all hover:bg-gray-50 dark:hover:bg-white/[0.04]"
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "h-5 w-5 flex items-center justify-center shrink-0 transition-transform",
            !hasChildren && "invisible"
          )}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200",
              expanded ? "rotate-90" : ""
            )}
          />
        </button>

        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center text-sm shrink-0"
          style={{ background: category.color ? `${category.color}18` : "rgba(15,105,176,0.08)" }}
        >
          {category.icon || "📦"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{category.name || "Unnamed"}</p>
          <p className="text-[9px] text-muted-foreground font-medium">
            {category.productsCount || 0} products · {category.subcategoriesCount || 0} sub
          </p>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(category); }}
            className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-colors cursor-pointer"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd?.(category); }}
            className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600 transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-6 border-l border-gray-100 dark:border-white/[0.06]">
              {children.map((child) => (
                <TreeNode
                  key={child.id}
                  category={child}
                  level={level + 1}
                  onEdit={onEdit}
                  onAdd={onAdd}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CategoryTree({ onEdit, onAdd }) {
  const rootCategories = (dummyCategories || []).filter(
    (c) => c && c.level === 1
  );

  if (rootCategories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-muted-foreground font-medium">No categories yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {rootCategories.map((cat) => (
        <TreeNode
          key={cat.id}
          category={cat}
          level={0}
          onEdit={onEdit}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}