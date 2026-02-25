"use client";

import Link from "next/link";
import { UI } from "@/lib/ui/styles";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/60 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl border border-neutral-800 bg-neutral-900/50 flex items-center justify-center font-bold">
            PF
          </div>
          <div className="leading-tight">
            <div className="text-white font-semibold">PatternForge</div>
            <div className="text-xs text-neutral-400">Learn patterns visually</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/visualize" className={UI.btnGhost}>
            Visualizers
          </Link>
          <Link href="/" className={UI.btnPrimary}>
            Analyzer
          </Link>
        </div>
      </div>
    </div>
  );
}