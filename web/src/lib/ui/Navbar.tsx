"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function NavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link href={href} className="relative group px-1">
      <span
        className={[
          "relative z-10 inline-flex items-center rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300",
          isActive
            ? "text-white"
            : "text-neutral-400 group-hover:text-neutral-200",
        ].join(" ")}
      >
        {label}
      </span>

      {isActive && (
        <motion.span
          layoutId="navActivePill"
          className="absolute inset-0 rounded-full border border-blue-500/30 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] z-0"
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        />
      )}
      {!isActive && (
        <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-colors duration-300 z-0" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("analyzer");

  useEffect(() => {
    // Only apply scroll spy on the homepage
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const visualizersSection = document.getElementById("visualizers");
      if (visualizersSection) {
        const rect = visualizersSection.getBoundingClientRect();
        const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;

        // Active if visualizers section enters the bottom half of the screen, or we reach the bottom of the page Let's use 0.7*innerHeight so it triggers slightly earlier.
        if (rect.top <= window.innerHeight * 0.7 || isAtBottom) {
          setActiveSection("visualizers");
        } else {
          setActiveSection("analyzer");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Call once initially
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
      {/* subtle glow behind navbar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 h-56 w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent blur-3xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center shadow-lg shadow-black/50 group-hover:border-blue-500/40 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-500 relative overflow-hidden">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-500"
            >
              <path
                d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                stroke="url(#hex-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12M12 12L3 7M12 12l9-5"
                stroke="url(#inner-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.5" fill="#60A5FA" className="animate-pulse" />

              <defs>
                <linearGradient id="hex-grad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#C084FC" />
                </linearGradient>
                <linearGradient id="inner-grad" x1="3" y1="7" x2="21" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FB923C" />
                  <stop offset="1" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-white font-bold tracking-wide">PatternForge</div>
            <div className="text-xs text-blue-400/80 font-medium tracking-wider uppercase mt-0.5">Learn visual patterns</div>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink href="/" label="Analyzer" isActive={activeSection === "analyzer"} />
          <NavLink href="/#visualizers" label="Visualizers" isActive={activeSection === "visualizers"} />
        </div>
      </div>
    </div>
  );
}