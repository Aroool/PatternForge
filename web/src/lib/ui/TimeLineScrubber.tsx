"use client";

import { motion } from "framer-motion";

type Props = {
  total: number;
  current: number;
  onChange: (index: number) => void;
};

export default function TimelineScrubber({
  total,
  current,
  onChange,
}: Props) {
  const progress =
    total <= 1 ? 0 : (current / (total - 1)) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="relative h-3 rounded-full bg-neutral-800 overflow-hidden cursor-pointer"
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percent = x / rect.width;
          const step = Math.round(percent * (total - 1));
          onChange(step);
        }}
      >
        {/* Glow Track */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/40 to-white/10 shadow-[0_0_20px_rgba(255,255,255,0.35)]"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        />

        {/* Handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          animate={{ left: `calc(${progress}% - 10px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.15 }}
        />
      </div>

      <div className="flex justify-between text-xs text-neutral-400">
        <span>0</span>
        <span>
          Step {total ? current + 1 : 0} / {total}
        </span>
        <span>{total > 0 ? total - 1 : 0}</span>
      </div>
    </div>
  );
}