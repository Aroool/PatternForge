"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UI } from "@/lib/ui/styles";

const items = [
  {
    title: "Sliding Window (Sum ≤ k)",
    desc: "Watch L/R move while sum stays within k.",
    href: "/visualize/sliding-window",
    tag: "Window • Arrays",
  },
  {
    title: "Substring Window (≤ k distinct)",
    desc: "See freq map + window validity while L/R adjusts.",
    href: "/visualize/substring-window",
    tag: "Window • Strings",
  },
];

export default function VisualizeHome() {
  return (
    <main className={UI.page}>
      <div className={UI.container}>
        <header className="space-y-2">
          <h1 className={UI.title}>Visualizers</h1>
          <p className={UI.subtitle}>
            Pick a pattern. See it move. Understand it forever.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((it) => (
            <motion.div
              key={it.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`${UI.panel} ${UI.panelInner}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className={UI.sectionTitle}>{it.title}</div>
                  <div className={UI.hint}>{it.desc}</div>
                </div>
                <div className={UI.chip}>{it.tag}</div>
              </div>

              <div className="pt-3">
                <Link href={it.href} className={UI.btnPrimary}>
                  Open →
                </Link>
              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </main>
  );
}