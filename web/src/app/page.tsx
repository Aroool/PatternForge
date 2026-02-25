"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/lib/ui/Navbar";
import { UI } from "@/lib/ui/styles";
import { analyzeProblem } from "@/lib/analyzer/analyze";

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

      {/* HERO */}
      <div className={UI.container}>
        <section className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Crack DSA patterns by{" "}
            <span className="text-neutral-300">seeing them move</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="text-neutral-300 max-w-2xl"
          >
            Paste a question → get the likely pattern + reasons.
            Then open a visualizer to watch pointers, windows, maps, and invariants in action.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="flex gap-3 flex-wrap"
          >
            <Link href="/visualize" className={UI.btnPrimary}>
              Explore Visualizers →
            </Link>
            <a href="#analyzer" className={UI.btnGhost}>
              Try Analyzer ↓
            </a>
          </motion.div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Visualizers Hub"
            desc="All animations in one place. Sliding Window, Substring, and more."
            href="/visualize"
            tag="Learn"
          />
          <FeatureCard
            title="Sliding Window (Sum ≤ k)"
            desc="Watch L/R move and the window expand/shrink with live notes."
            href="/visualize/sliding-window"
            tag="Arrays"
          />
          <FeatureCard
            title="Substring Window (≤ k distinct)"
            desc="Live frequency map + validity banner + best window tracking."
            href="/visualize/substring-window"
            tag="Strings"
          />
        </section>

        {/* ANALYZER */}
        <section id="analyzer" className="pt-8 space-y-4">
          <div className="space-y-1">
            <div className="text-xl md:text-2xl font-bold text-white">
              Pattern Analyzer
            </div>
            <div className={UI.subtitle}>
              Paste any LeetCode-style prompt. Get the pattern + convincing reasons.
            </div>
          </div>

          <div className={`${UI.panel} ${UI.panelInner}`}>
            <div className="space-y-2">
              <div className={UI.sectionTitle}>Problem</div>
              <textarea
                className={UI.textarea}
                placeholder="Paste a coding question here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={onAnalyze}
                disabled={!canAnalyze}
                className={UI.btnPrimary}
              >
                Analyze
              </button>
              <button
                onClick={() => {
                  setText("");
                  setResult(null);
                }}
                className={UI.btnGhost}
              >
                Clear
              </button>
              <Link href="/visualize" className={UI.btnGhost}>
                Open Visualizers →
              </Link>
            </div>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`${UI.card} ${UI.cardInner}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-lg font-semibold text-white">
                    Pattern: <span className="font-bold">{result.pattern}</span>
                  </div>
                  <div className={UI.chip}>Confidence: {result.confidence}%</div>
                </div>

                <div className="space-y-2">
                  <div className={UI.sectionTitle}>Why this pattern?</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-200">
                    {result.reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex gap-2 flex-wrap">
                  <Link href="/visualize" className={UI.btnPrimary}>
                    Visualize it →
                  </Link>
                  <Link href="/visualize/substring-window" className={UI.btnGhost}>
                    Substring Window
                  </Link>
                  <Link href="/visualize/sliding-window" className={UI.btnGhost}>
                    Sliding Window
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-10 pb-6 text-xs text-neutral-500">
          Built with Next.js + Tailwind + Framer Motion • PatternForge
        </footer>
      </div>
    </main>
  );
}