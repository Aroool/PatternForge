"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UI } from "@/lib/ui/styles";
import VisualizerShell from "@/lib/ui/VisualizerShell";

type Step = {
  l: number;
  r: number;
  sum: number;
  valid: boolean;
  action: "expand" | "shrink" | "best";
  note: string;

  bestLen: number;
  bestL: number;
  bestR: number;
};

function parseArray(text: string): number[] {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

/**
 * Demo: "Longest subarray with sum <= k" (positive numbers assumption).
 * Sliding window:
 * - expand r
 * - while sum > k, shrink l
 * - update best window by length
 */
function buildSteps(arr: number[], k: number): Step[] {
  const steps: Step[] = [];
  if (!arr.length) return steps;

  let l = 0;
  let sum = 0;

  let bestLen = 0;
  let bestL = 0;
  let bestR = -1;

  for (let r = 0; r < arr.length; r++) {
    sum += arr[r];

    steps.push({
      l,
      r,
      sum,
      valid: sum <= k,
      action: "expand",
      note: `Expand: add arr[${r}] = ${arr[r]} → sum = ${sum}`,
      bestLen,
      bestL,
      bestR,
    });

    while (sum > k && l <= r) {
      steps.push({
        l,
        r,
        sum,
        valid: false,
        action: "shrink",
        note: `Invalid: sum (${sum}) > k (${k}). Shrink from left.`,
        bestLen,
        bestL,
        bestR,
      });

      const removedIdx = l;
      sum -= arr[l];
      l++;

      steps.push({
        l,
        r,
        sum,
        valid: sum <= k,
        action: "shrink",
        note: `Shrink: remove arr[${removedIdx}] → sum = ${sum}, l = ${l}`,
        bestLen,
        bestL,
        bestR,
      });
    }

    // If valid, update best
    if (sum <= k) {
      const len = r - l + 1;
      if (len > bestLen) {
        bestLen = len;
        bestL = l;
        bestR = r;

        steps.push({
          l,
          r,
          sum,
          valid: true,
          action: "best",
          note: `✅ New best window: [${bestL}..${bestR}] length = ${bestLen}`,
          bestLen,
          bestL,
          bestR,
        });
      } else {
        steps.push({
          l,
          r,
          sum,
          valid: true,
          action: "expand",
          note: `Window valid: [${l}..${r}] length=${len}. Best=${bestLen}`,
          bestLen,
          bestL,
          bestR,
        });
      }
    }
  }

  return steps;
}

export default function SlidingWindowPage() {
  const [arrText, setArrText] = useState("2,1,5,1,3,2");
  const [kText, setKText] = useState("7");

  const arr = useMemo(() => parseArray(arrText), [arrText]);
  const k = useMemo(() => {
    const n = Number(kText);
    if (!Number.isFinite(n)) return 0;
    return Math.floor(n);
  }, [kText]);

  const steps = useMemo(() => buildSteps(arr, k), [arr, k]);

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

  // Geometry
  const cellWidth = 72;
  const baseX = 0;

  const leftX = step ? baseX + step.l * cellWidth : 0;
  const rightX = step ? baseX + step.r * cellWidth : 0;

  const bestArr =
    step && step.bestR >= step.bestL && step.bestR >= 0
      ? arr.slice(step.bestL, step.bestR + 1)
      : [];

  // ---------- Controls block ----------
  const controls = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <div className={UI.sectionTitle}>Array (comma separated)</div>
          <input
            className={UI.input}
            value={arrText}
            onChange={(e) => {
              setArrText(e.target.value);
              setI(0);
              setPlaying(false);
            }}
          />
          <div className={UI.hint}>Example: 2,1,5,1,3,2</div>
        </div>

        <div className="space-y-1">
          <div className={UI.sectionTitle}>k</div>
          <input
            className={UI.input}
            value={kText}
            onChange={(e) => {
              setKText(e.target.value);
              setI(0);
              setPlaying(false);
            }}
          />
          <div className={UI.hint}>We clamp to an integer</div>
        </div>

        <div className="space-y-1">
          <div className={UI.sectionTitle}>Playback</div>
          <div className="flex gap-2 flex-wrap">
            <button
              className={UI.btnPrimary}
              disabled={steps.length === 0 || playing}
              onClick={() => setPlaying(true)}
            >
              Play
            </button>

            <button
              className={UI.btnGhost}
              disabled={!playing}
              onClick={() => setPlaying(false)}
            >
              Pause
            </button>

            <button
              className={UI.btnGhost}
              disabled={steps.length === 0 || safeI === 0}
              onClick={() => {
                setPlaying(false);
                setI((x) => Math.max(0, x - 1));
              }}
            >
              Prev
            </button>

            <button
              className={UI.btnGhost}
              disabled={steps.length === 0 || safeI >= steps.length - 1}
              onClick={() => {
                setPlaying(false);
                setI((x) => Math.min(steps.length - 1, x + 1));
              }}
            >
              Next
            </button>

            <button
              className={UI.btnGhost}
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
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <div className={UI.sectionTitle}>Timeline</div>
          <div className={UI.hint}>
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
          className={UI.range}
          disabled={steps.length === 0}
        />
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-3 pt-2">
        <div className={UI.chip}>
          Step: <span className="font-semibold">{steps.length ? safeI + 1 : 0}</span> /{" "}
          <span className="font-semibold">{steps.length}</span>
        </div>
        <div className={UI.chip}>
          l: <span className="font-semibold">{step?.l ?? "-"}</span>
        </div>
        <div className={UI.chip}>
          r: <span className="font-semibold">{step?.r ?? "-"}</span>
        </div>
        <div className={UI.chip}>
          sum: <span className="font-semibold">{step?.sum ?? "-"}</span>
        </div>
        <div className={UI.chip}>
          k: <span className="font-semibold">{k}</span>
        </div>
      </div>

      {/* Valid/invalid banner */}
      {step && (
        <div className={`${UI.banner} mt-2`}>
          <div className="font-medium">
            {step.valid ? "✅ Window valid" : "❌ Window invalid"}
          </div>
          <div className={UI.bannerSub}>
            sum = <span className="font-semibold">{step.sum}</span>{" "}
            {step.valid ? "≤" : ">"} k = <span className="font-semibold">{k}</span>
          </div>
        </div>
      )}

      {/* Note */}
      <div className={`${UI.note} mt-2`}>
        <span className="font-medium">Note:</span> {step?.note ?? "—"}
      </div>
    </>
  );

  // ---------- Main visualization ----------
  const mainViz = (
    <>
      <div className={UI.sectionTitle}>Array</div>

      <div className="relative overflow-x-auto">
        <div className="relative inline-block" style={{ paddingTop: 44 }}>
          {/* Window highlight behind cells */}
          {step && (
            <motion.div
              className={UI.windowHighlight}
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
                className="absolute top-0 text-xs font-semibold text-white"
                initial={false}
                animate={{ x: leftX }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                style={{ width: cellWidth }}
              >
                L
              </motion.div>

              <motion.div
                className="absolute top-0 text-xs font-semibold text-right text-white"
                initial={false}
                animate={{ x: rightX }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                style={{ width: cellWidth }}
              >
                R
              </motion.div>
            </>
          )}

          {/* Cells above highlight */}
          <div className="relative z-10 flex">
            {arr.map((val, idx) => {
              const inWindow = step ? idx >= step.l && idx <= step.r : false;

              const isAdded = step?.action === "expand" && idx === step.r;
              const isRemoved = step?.action === "shrink" && idx === step.l - 1;

              const cls = [
                `h-12 w-[72px] ${UI.cellBase}`,
                inWindow ? UI.cellActive : UI.cellInactive,
                isAdded ? UI.cellAdded : "",
                isRemoved ? UI.cellRemoved : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={idx} className={cls}>
                  {val}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  // ---------- Footer (best window) ----------
  const footer = (
    <>
      <div className={`${UI.card} ${UI.cardInner}`}>
        <div className={UI.sectionTitle}>Best window so far</div>
        <div className="text-sm text-neutral-200">
          length: <span className="font-semibold">{step?.bestLen ?? 0}</span> · indices:{" "}
          <span className="font-semibold">{step ? `${step.bestL}..${step.bestR}` : "-"}</span>
        </div>
        <div className="text-sm text-neutral-200">
          subarray:{" "}
          <span className="font-semibold">
            {bestArr.length ? `[${bestArr.join(", ")}]` : "—"}
          </span>
        </div>
      </div>

      <div className={UI.hint}>
        Tip: This demo assumes all numbers are positive (classic sliding window).
      </div>
    </>
  );

  return (
    <VisualizerShell
      title="Sliding Window Visualizer"
      subtitle={
        <>
          Demo: Find the <span className="font-semibold">longest subarray</span>{" "}
          where <span className="font-semibold">sum ≤ k</span>{" "}
          <span className="text-neutral-400">(assumes positive numbers)</span>
        </>
      }
      controls={controls}
      footer={footer}
    >
      {mainViz}
    </VisualizerShell>
  );
}