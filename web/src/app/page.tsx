"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/lib/ui/Navbar";
import { UI } from "@/lib/ui/styles";
import { analyzeProblem } from "@/lib/analyzer/analyze";
import ParticleField from "@/lib/ui/ParticleField";

import AnimatedText from "@/lib/ui/AnimatedText";

type AnalyzeResult = {
  pattern: string;
  confidence: number;
  reasons: string[];
};

function FeatureCard({
  title,
  desc,
  href,
  tag,
}: {
  title: string;
  desc: string;
  href: string;
  tag: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`${UI.panel} ${UI.panelInner}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className={UI.sectionTitle}>{title}</div>
          <div className={UI.hint}>{desc}</div>
        </div>
        <div className={UI.chip}>{tag}</div>
      </div>

      <div className="pt-3">
        <Link href={href} className={UI.btnPrimary}>
          Open →
        </Link>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const canAnalyze = useMemo(() => text.trim().length > 0, [text]);

  const onAnalyze = () => {
    const res = analyzeProblem(text);
    setResult({
      pattern: res.pattern,
      confidence: res.confidence,
      reasons: res.reasons,
    });
  };

  return (
    <main className={UI.page}>
      <Navbar />

      {/* Antigravity-style particles background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <ParticleField className="absolute inset-0" density={1} />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className={UI.container}>
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center justify-center min-h-[100vh] -mt-20 pt-20">
          {/* Ambient Background Glow to fill empty space */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

          {/* Hero Content */}
          <div className="text-center space-y-4 max-w-4xl z-10 px-4 -mt-10">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight relative"
            >
              Crack DSA patterns by <br className="hidden md:block" />
              <div className="mt-4 md:mt-2 inline-block">
                <AnimatedText />
              </div>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-neutral-300 text-base md:text-lg font-light mx-auto max-w-2xl pt-2"
            >
              Paste any LeetCode prompt instantly. Get the pattern, understand the 'why', and watch the logic animate in real-time.
            </motion.p>
          </div>

          {/* Cool Round Arrow leading to Analyzer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="absolute bottom-16"
          >
            <Link href="#analyzer" className="flex flex-col items-center gap-3 text-neutral-500 hover:text-white transition-colors group">
              <span className="text-xs tracking-widest uppercase font-bold text-blue-400/80 group-hover:text-blue-300">
                Analyze Prompt
              </span>
              <div className="w-12 h-12 rounded-full border border-blue-500/30 bg-blue-500/5 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all animate-bounce">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        </section>

        {/* ANALYZER SECTION */}
        <section id="analyzer" className="relative py-24 min-h-[70vh] flex flex-col items-center justify-center border-t border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="text-center mb-10 space-y-2 z-10 px-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">Pattern Analyzer</h2>
            <p className="text-neutral-400">Discover the optimal approach for any LeetCode problem.</p>
          </div>

          {/* Integrated Analyzer Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl z-10 px-4"
          >
            <div className={`${UI.panel} ${UI.panelInner} shadow-2xl shadow-blue-900/10 border border-white/10 backdrop-blur-xl bg-black/40`}>
              <div className="space-y-4">
                <textarea
                  className={`${UI.textarea} bg-white/5 border-white/10 focus:border-blue-500/50 min-h-[120px] text-lg`}
                  placeholder="Paste your LeetCode problem description here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <button
                      onClick={onAnalyze}
                      disabled={!canAnalyze}
                      className={`${UI.btnPrimary} px-8 py-3 rounded-full text-base font-semibold transition-transform active:scale-95`}
                    >
                      Analyze Prompt
                    </button>
                    {text.length > 0 && (
                      <button
                        onClick={() => {
                          setText("");
                          setResult(null);
                        }}
                        className={`${UI.btnGhost} px-6 rounded-full`}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <Link href="/visualize" className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
                    Or explore visualizers →
                  </Link>
                </div>
              </div>

              {/* Analysis Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-xl text-neutral-300">
                          Detected Pattern:
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          {result.pattern}
                        </div>
                        <div className="ml-2 px-2 py-1 rounded bg-white/10 text-xs font-mono text-neutral-300 border border-white/10">
                          {result.confidence}% Match
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-neutral-400 uppercase tracking-wider font-semibold">Reasoning</div>
                        <ul className="space-y-2">
                          {result.reasons.map((r, idx) => (
                            <li key={idx} className="text-neutral-200 text-sm flex gap-2">
                              <span className="text-blue-400">▹</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <div className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-1">Actions</div>
                      <Link href="/visualize" className={`${UI.btnPrimary} justify-center w-full`}>
                        Visualize Logic →
                      </Link>
                      <Link href="/visualize/sliding-window" className={`${UI.btnGhost} justify-center w-full text-sm`}>
                        Sliding Window Demo
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>

        {/* REFINED "LEARN" SECTION (Replacing Repetitive Cards) */}
        <section id="visualizers" className="py-16 border-t border-white/10">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Master the core concepts</h2>
            <p className="text-neutral-400">Interactive playgrounds to build your algorithmic intuition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/visualize/sliding-window" className="group block">
              <div className={`${UI.panel} ${UI.panelInner} h-full transition-all duration-300 border-white/5 hover:border-blue-500/30 hover:bg-blue-900/10`}>
                <div className="h-32 mb-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent flex items-center justify-center border border-white/5 group-hover:border-blue-500/20 transition-colors">
                  <div className="font-mono text-blue-400/50 text-xl tracking-widest">[ L ... R ]</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sliding Window</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">Expand and shrink dynamic window boundaries to solve contiguous array problems efficiently.</p>
              </div>
            </Link>

            <Link href="/visualize/substring-window" className="group block">
              <div className={`${UI.panel} ${UI.panelInner} h-full transition-all duration-300 border-white/5 hover:border-purple-500/30 hover:bg-purple-900/10`}>
                <div className="h-32 mb-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent flex items-center justify-center border border-white/5 group-hover:border-purple-500/20 transition-colors">
                  <div className="font-mono text-purple-400/50 text-xl tracking-widest">Map{"{a:2}"}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Substring Validator</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">Track frequencies and validity conditions while sliding over text sequences.</p>
              </div>
            </Link>

            <Link href="/visualize" className="group block">
              <div className={`${UI.panel} ${UI.panelInner} h-full transition-all duration-300 border-white/5 hover:border-emerald-500/30 hover:bg-emerald-900/10 flex flex-col items-center justify-center text-center`}>
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">View All Modules</h3>
                <p className="text-sm text-neutral-400">Binary Search, Two Pointers, and more coming soon.</p>
              </div>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-8 text-center border-t border-white/10">
          <div className="text-xs text-neutral-500 font-medium tracking-wide">
            BUILT WITH NEXT.JS + TAILWIND + FRAMER MOTION • PATTERNFORGE
          </div>
        </footer>
      </div>
    </main>
  );
}