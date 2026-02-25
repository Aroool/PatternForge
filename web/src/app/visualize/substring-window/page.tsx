"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type FreqMap = Record<string, number>;

type Step = {
  l: number;
  r: number;
  charAdded?: string;
  charRemoved?: string;
  freq: FreqMap;
  distinct: number;
  valid: boolean;
  note: string;

  bestLen: number;
  bestL: number;
  bestR: number;
};

function cloneFreq(freq: FreqMap): FreqMap {
  return { ...freq };
}

function distinctCount(freq: FreqMap): number {
  let d = 0;
  for (const k of Object.keys(freq)) {
    if (freq[k] > 0) d++;
  }
  return d;
}

/**
 * Build animation steps for:
 * "Longest substring with at most k distinct characters"
 */
function buildSteps(s: string, k: number): Step[] {
  const steps: Step[] = [];
  if (!s.length) return steps;
  if (k < 0) k = 0;

  let l = 0;
  const freq: FreqMap = {};
  let bestLen = 0;
  let bestL = 0;
  let bestR = -1;

  for (let r = 0; r < s.length; r++) {
    const ch = s[r];
    freq[ch] = (freq[ch] ?? 0) + 1;

    let d = distinctCount(freq);
    let valid = d <= k;

    steps.push({
      l,
      r,
      charAdded: ch,
      freq: cloneFreq(freq),
      distinct: d,
      valid,
      note: `Expand: add '${ch}' at r=${r}. distinct=${d} (k=${k}).`,
      bestLen,
      bestL,
      bestR,
    });

    // Shrink until valid
    while (d > k && l <= r) {
      steps.push({
        l,
        r,
        freq: cloneFreq(freq),
        distinct: d,
        valid: false,
        note: `Invalid: distinct=${d} > k=${k}. Shrink from left.`,
        bestLen,
        bestL,
        bestR,
      });

      const leftChar = s[l];
      freq[leftChar] = (freq[leftChar] ?? 0) - 1;
      if (freq[leftChar] <= 0) delete freq[leftChar];
      l++;

      d = distinctCount(freq);
      valid = d <= k;

      steps.push({
        l,
        r,
        charRemoved: leftChar,
        freq: cloneFreq(freq),
        distinct: d,
        valid,
        note: `Shrink: removed '${leftChar}'. l=${l}. distinct=${d} (k=${k}).`,
        bestLen,
        bestL,
        bestR,
      });
    }

    // If valid, update best
    if (valid) {
      const len = r - l + 1;
      if (len > bestLen) {
        bestLen = len;
        bestL = l;
        bestR = r;

        steps.push({
          l,
          r,
          freq: cloneFreq(freq),
          distinct: d,
          valid: true,
          note: `New best window: [${bestL}..${bestR}] length=${bestLen}.`,
          bestLen,
          bestL,
          bestR,
        });
      } else {
        steps.push({
          l,
          r,
          freq: cloneFreq(freq),
          distinct: d,
          valid: true,
          note: `Window valid: [${l}..${r}] length=${len}. Best=${bestLen}.`,
          bestLen,
          bestL,
          bestR,
        });
      }
    }
  }

  return steps;
}

export default function SubstringWindowPage() {
  const [sText, setSText] = useState("eceba");
  const [kText, setKText] = useState("2");

  const s = useMemo(() => sText, [sText]);
  const k = useMemo(() => {
    const n = Number(kText);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  }, [kText]);

  const steps = useMemo(() => buildSteps(s, k), [s, k]);

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  const safeI = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.min(i, steps.length - 1);
  }, [i, steps.length]);

  const step = steps.length ? steps[safeI] : undefined;

  // Proper play/pause
  useEffect(() => {
    if (!playing) return;
    if (steps.length === 0) return;

    const id = setInterval(() => {
      setI((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, 650);

    return () => clearInterval(id);
  }, [playing, steps.length]);

  // Animation geometry
  const cellWidth = 64;
  const baseX = 0;

  const leftX = step ? baseX + step.l * cellWidth : 0;
  const rightX = step ? baseX + step.r * cellWidth : 0;

  const bestText =
    step && step.bestR >= step.bestL && step.bestR >= 0
      ? s.slice(step.bestL, step.bestR + 1)
      : "";

  const freqEntries = useMemo(() => {
    if (!step) return [];
    return Object.entries(step.freq).sort((a, b) => a[0].localeCompare(b[0]));
  }, [step]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Substring Window Visualizer
          </h1>
          <p className="text-sm md:text-base text-neutral-600">
            Goal: <span className="font-semibold">Longest substring</span> with{" "}
            <span className="font-semibold">at most k distinct</span> characters.
          </p>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">String s</div>
              <input
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-300"
                value={sText}
                onChange={(e) => {
                  setSText(e.target.value);
                  setI(0);
                  setPlaying(false);
                }}
              />
              <div className="text-xs text-neutral-500">
                Example: eceba, aaabbcc, abaccc
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">k</div>
              <input
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-300"
                value={kText}
                onChange={(e) => {
                  setKText(e.target.value);
                  setI(0);
                  setPlaying(false);
                }}
              />
              <div className="text-xs text-neutral-500">
                We clamp to an integer ≥ 0
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Playback</div>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-40"
                  disabled={steps.length === 0 || playing}
                  onClick={() => setPlaying(true)}
                >
                  Play
                </button>

                <button
                  className="rounded-xl px-4 py-2 border disabled:opacity-40"
                  disabled={!playing}
                  onClick={() => setPlaying(false)}
                >
                  Pause
                </button>

                <button
                  className="rounded-xl px-4 py-2 border disabled:opacity-40"
                  disabled={steps.length === 0 || safeI === 0}
                  onClick={() => {
                    setPlaying(false);
                    setI((x) => Math.max(0, x - 1));
                  }}
                >
                  Prev
                </button>

                <button
                  className="rounded-xl px-4 py-2 border disabled:opacity-40"
                  disabled={steps.length === 0 || safeI >= steps.length - 1}
                  onClick={() => {
                    setPlaying(false);
                    setI((x) => Math.min(steps.length - 1, x + 1));
                  }}
                >
                  Next
                </button>

                <button
                  className="rounded-xl px-4 py-2 border disabled:opacity-40"
                  disabled={steps.length === 0}
                  onClick={() => {
                    setPlaying(false);
                    setI(0);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Timeline</div>
              <div className="text-xs text-neutral-600">
                {steps.length ? safeI + 1 : 0} / {steps.length}
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={Math.max(0, steps.length - 1)}
              value={safeI}
              onChange={(e) => {
                setPlaying(false);
                setI(Number(e.target.value));
              }}
              className="w-full"
              disabled={steps.length === 0}
            />
          </div>

          {/* Status + Banner */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-full border border-neutral-700 bg-neutral-900/60 text-white px-3 py-1">
              Step:{" "}
              <span className="font-semibold">{steps.length ? safeI + 1 : 0}</span>{" "}
              / <span className="font-semibold">{steps.length}</span>
            </div>
            <div className="rounded-full border border-neutral-700 bg-neutral-900/60 text-white px-3 py-1">
              l: <span className="font-semibold">{step?.l ?? "-"}</span>
            </div>
            <div className="rounded-full border border-neutral-700 bg-neutral-900/60 text-white px-3 py-1">
              r: <span className="font-semibold">{step?.r ?? "-"}</span>
            </div>
            <div className="rounded-full border border-neutral-700 bg-neutral-900/60 text-white px-3 py-1">
              distinct: <span className="font-semibold">{step?.distinct ?? "-"}</span>
            </div>
            <div className="rounded-full border border-neutral-700 bg-neutral-900/60 text-white px-3 py-1">
              k: <span className="font-semibold">{k}</span>
            </div>
          </div>

          {step && (
            <div
              className={[
                "rounded-xl border px-4 py-3 text-sm",
                step.valid ? "bg-white" : "bg-neutral-50",
              ].join(" ")}
            >
              <div className="font-medium">
                {step.valid ? "✅ Valid window" : "❌ Invalid window"}
              </div>
              <div className="text-neutral-200">
                distinct = <span className="font-semibold">{step.distinct}</span>{" "}
                {step.valid ? "≤" : ">"} k ={" "}
                <span className="font-semibold">{k}</span>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="text-sm text-neutral-700">
            <span className="font-medium">Note:</span> {step?.note ?? "—"}
          </div>
        </section>

        {/* Main Visualization + Freq Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* String visualization */}
          <div className="lg:col-span-2 rounded-2xl border p-5 md:p-6 space-y-4">
            <div className="text-sm font-medium">String</div>

            <div className="relative overflow-x-auto">
              <div className="relative inline-block" style={{ paddingTop: 44 }}>
                {/* Window highlight */}
                {step && (
                  <motion.div
                    className="absolute top-8 h-12 rounded-xl border border-neutral-500 bg-white/10 backdrop-blur-sm shadow-[0_0_18px_rgba(255,255,255,0.12)]"
                    initial={false}
                    animate={{
                      x: baseX + step.l * cellWidth,
                      width: (step.r - step.l + 1) * cellWidth,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  />
                )}

                {/* Pointer labels */}
                {step && (
                  <>
                    <motion.div
                      className="absolute top-0 text-xs font-semibold"
                      initial={false}
                      animate={{ x: leftX }}
                      transition={{ type: "spring", stiffness: 260, damping: 30 }}
                      style={{ width: cellWidth }}
                    >
                      L
                    </motion.div>

                    <motion.div
                      className="absolute top-0 text-xs font-semibold text-right"
                      initial={false}
                      animate={{ x: rightX }}
                      transition={{ type: "spring", stiffness: 260, damping: 30 }}
                      style={{ width: cellWidth }}
                    >
                      R
                    </motion.div>
                  </>
                )}

                {/* Cells */}
                <div className="relative flex">
                  {Array.from(s).map((ch, idx) => {
                    const inWindow = step ? idx >= step.l && idx <= step.r : false;
                    const isAdded = step?.charAdded && idx === step.r && step.charAdded === ch;
                    const isRemoved =
                      step?.charRemoved && idx === step.l - 1 && step.charRemoved === ch;

                    const cls = [
                      "h-12 w-[64px] flex items-center justify-center border rounded-xl mx-1 text-sm font-semibold",
                      inWindow ? "bg-white" : "bg-transparent",
                      isAdded ? "ring-2 ring-neutral-400" : "",
                      isRemoved ? "opacity-60" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <div key={idx} className={cls}>
                        {ch === " " ? "␠" : ch}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Best window so far */}
            <div className="rounded-xl border bg-neutral-50/50 p-4 space-y-1">
              <div className="text-sm font-medium">Best window so far</div>
              <div className="text-sm text-neutral-700">
                length: <span className="font-semibold">{step?.bestLen ?? 0}</span>
                {" · "}
                indices:{" "}
                <span className="font-semibold">
                  {step ? `${step.bestL}..${step.bestR}` : "-"}
                </span>
              </div>
              <div className="text-sm">
                substring:{" "}
                <span className="font-semibold">{bestText ? `"${bestText}"` : "—"}</span>
              </div>
            </div>
          </div>

          {/* Frequency map */}
          <div className="rounded-2xl border p-5 md:p-6 space-y-4">
            <div className="text-sm font-medium">Frequency Map</div>

            {step ? (
              freqEntries.length ? (
                <div className="space-y-2">
                  {freqEntries.map(([ch, count]) => (
                    <div
                      key={ch}
                      className="flex items-center justify-between rounded-xl border px-3 py-2 bg-white"
                    >
                      <div className="text-sm font-semibold">
                        {ch === " " ? "␠ (space)" : `'${ch}'`}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-neutral-600">
                  Window is empty (no characters tracked).
                </div>
              )
            ) : (
              <div className="text-sm text-neutral-600">
                Enter a string and press Play/Next.
              </div>
            )}

            <div className="text-xs text-neutral-500">
              distinct = number of keys in this map
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}