"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { UI } from "@/lib/ui/styles";

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();

  // Active if exact match OR you're inside that section.
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link href={href} className="relative">
      <span
        className={[
          "relative z-10 inline-flex items-center rounded-xl px-4 py-2 text-sm border transition-colors",
          active
            ? "text-white border-neutral-600 bg-neutral-900/70"
            : "text-neutral-200 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40",
        ].join(" ")}
      >
        {label}
      </span>

      {active && (
        <motion.span
          layoutId="navActivePill"
          className="absolute inset-0 rounded-xl bg-white/5"
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        />
      )}
    </Link>
  );
}

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/60 backdrop-blur-md">
      {/* subtle glow behind navbar */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-24 left-1/2 h-56 w-[680px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
          animate={{ opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl border border-neutral-800 bg-neutral-900/50 flex items-center justify-center font-bold text-white">
            PF
          </div>
          <div className="leading-tight">
            <div className="text-white font-semibold">PatternForge</div>
            <div className="text-xs text-neutral-400">Learn patterns visually</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <NavLink href="/" label="Analyzer" />
          <NavLink href="/visualize" label="Visualizers" />
        </div>
      </div>
    </div>
  );
}