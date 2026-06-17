// src/components/AnimatedList.tsx
import React, { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function AnimatedList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 overflow-hidden py-2">
      <AnimatePresence initial={false}>
        {children}
      </AnimatePresence>
    </div>
  );
}

export function AnimatedListItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: -20, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ 
        type: "spring", 
        stiffness: 350, 
        damping: 25, 
        mass: 1 
      }}
      className="w-full origin-top"
    >
      {children}
    </motion.div>
  );
}