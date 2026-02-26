"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import VisualizerShell from "@/lib/ui/VisualizerShell";
import { UI } from "@/lib/ui/styles";

type Step = {
  lo: number;
  hi: number;
  mid: number;
  midVal: number | null;
  decision: "start" | "go_left" | "go_right" | "found" | "not_found";
  note: string;
};

function parseArray(text: string): number[] {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

function buildSteps(arr: number[], target: number): Step[] {
  const steps: Step[] = [];

  if (arr.length === 0) {
    steps.push({
      lo: 0,
      hi: -1,
      mid: -1,
      midVal: null,
      decision: "not_found",
      note: "Array is empty → nothing to search.",
    });
    return steps;
  }

  let lo = 0;
  let hi = arr.length - 1;

  steps.push({
    lo,
    hi,
    mid: Math.floor((lo + hi) / 2),
    midVal: arr[Math.floor((lo + hi) / 2)],
    decision: "start",
    note: `Start: lo=0, hi=${hi}. We'll keep shrinking the search range.`,
  });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midVal = arr[mid];

    if (midVal === target) {
      steps.push({
        lo,
        hi,
        mid,
        midVal,
        decision: "found",
        note: `Found! arr[mid]=${midVal} equals target=${target}.`,
      });
      return steps;
    }

    if (midVal < target) {
      steps.push({
        lo,
        hi,
        mid,
        midVal,
        decision: "go_right",
        note: `arr[mid]=${midVal} < target=${target} → discard LEFT half (lo..mid). Move lo = mid+1.`,
      });
      lo = mid + 1;
    } else {
      steps.push({
        lo,
        hi,
        mid,
        midVal,
        decision: "go_left",
        note: `arr[mid]=${midVal} > target=${target} → discard RIGHT half (mid..hi). Move hi = mid-1.`,
      });
      hi = mid - 1;
    }

    if (lo <= hi) {
      const nextMid = Math.floor((lo + hi) / 2);
      steps.push({
        lo,
        hi,
        mid: nextMid,
        midVal: arr[nextMid],
        decision: "start",
        note: `New range: lo=${lo}, hi=${hi}. Recompute mid.`,
      });
    }
  }

  steps.push({
    lo,
    hi,
    mid: -1,
    midVal: null,
    decision: "not_found",
    note: `Not found. Range became empty (lo > hi).`,
  });

  return steps;
}

export default function BinarySearchPage() {
  const [arrText, setArrText] = useState("1,3,5,7,9,11,13,15");
  const [targetText, setTargetText] = useState("9");

  const arr = useMemo(() => parseArray(arrText), [arrText]);
  const target = useMemo(() => {
    const n = Number(targetText);
    return Number.isFinite(n) ? n : 0;
  }, [targetText]);

  const steps = useMemo(() => buildSteps(arr, target), [arr, target]);

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(650);

  const safeI = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.min(i, steps.length - 1);
  }, [i, steps.length]);

  const step = steps.length ? steps[safeI] : undefined;

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
    }, speedMs);

    return () => clearInterval(id);
  }, [playing, steps.length, speedMs]);

  // --- Animation geometry ---
  const cellWidth = 72;
  const baseX = 0;

  const loX = step ? baseX + step.lo * cellWidth : 0;
  const hiX = step ? baseX + step.hi * cellWidth : 0;
  const midX = step && step.mid >= 0 ? baseX + step.mid * cellWidth : 0;

  const rangeWidth =
    step && step.hi >= step.lo ? (step.hi - step.lo + 1) * cellWidth : 0;

  const bannerText = useMemo(() => {
    if (!step) return "";
    if (step.decision === "found") return "✅ Found";
    if (step.decision === "not_found") return "❌ Not Found";
    return "🔎 Searching";
  }, [step]);

  return (
    <VisualizerShell
      title="Binary Search Visualizer"
      subtitle="Goal: find target in a sorted array by shrinking lo..hi."
    >
      {/* Controls */}
      <section className={`${UI.panel} ${UI.panelInner} space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className={UI.sectionTitle}>Sorted array (comma separated)</div>
            <input
              className={UI.input}
              value={arrText}
              onChange={(e) => {
                setArrText(e.target.value);
                setI(0);
                setPlaying(false);
              }}
            />
            <div className={UI.hint}>
              Tip: keep it sorted (binary search assumes sorted!)
            </div>
          </div>

          <div className="space-y-1">
            <div className={UI.sectionTitle}>Target</div>
            <input
              className={UI.input}
              value={targetText}
              onChange={(e) => {
                setTargetText(e.target.value);
                setI(0);
                setPlaying(false);
              }}
            />
            <div className={UI.hint}>Example: 9</div>
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

            <div className="flex items-center gap-3 pt-2">
              <div className={UI.hint}>Speed</div>
              <input
                type="range"
                min={250}
                max={1200}
                step={50}
                value={speedMs}
                onChange={(e) => setSpeedMs(Number(e.target.value))}
                className="w-full"
              />
              <div className={UI.hint}>{speedMs}ms</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
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
            className="w-full"
            disabled={steps.length === 0}
          />
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className={UI.chip}>
            Step: <span className="font-semibold">{steps.length ? safeI + 1 : 0}</span> /{" "}
            <span className="font-semibold">{steps.length}</span>
          </div>
          <div className={UI.chip}>
            lo: <span className="font-semibold">{step?.lo ?? "-"}</span>
          </div>
          <div className={UI.chip}>
            mid: <span className="font-semibold">{step?.mid ?? "-"}</span>
          </div>
          <div className={UI.chip}>
            hi: <span className="font-semibold">{step?.hi ?? "-"}</span>
          </div>
          <div className={UI.chip}>
            target: <span className="font-semibold">{target}</span>
          </div>
        </div>

        {/* Banner + note */}
        {step && (
          <div className={UI.banner}>
            <div className="font-medium">{bannerText}</div>
            <div className="text-neutral-200">{step.note}</div>
          </div>
        )}
      </section>

      {/* Visualization */}
      <section className={`${UI.panel} ${UI.panelInner} space-y-4`}>
        <div className={UI.sectionTitle}>Array</div>

        <div className="relative overflow-x-auto">
          <div className="relative inline-block" style={{ paddingTop: 54 }}>
            {/* Search range highlight (lo..hi) */}
            {step && step.hi >= step.lo && (
              <motion.div
                className={UI.windowHighlight}
                initial={false}
                animate={{
                  x: loX,
                  width: rangeWidth,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              />
            )}

            {/* L / M / H labels */}
            {step && (
              <>
                <motion.div
                  className="absolute top-0 text-xs font-semibold text-white"
                  initial={false}
                  animate={{ x: loX }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  style={{ width: cellWidth }}
                >
                  lo
                </motion.div>

                {step.mid >= 0 && (
                  <motion.div
                    className="absolute top-0 text-xs font-semibold text-white text-center"
                    initial={false}
                    animate={{ x: midX }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    style={{ width: cellWidth }}
                  >
                    mid
                  </motion.div>
                )}

                <motion.div
                  className="absolute top-0 text-xs font-semibold text-white text-right"
                  initial={false}
                  animate={{ x: hiX }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  style={{ width: cellWidth }}
                >
                  hi
                </motion.div>
              </>
            )}

            {/* Cells */}
            <div className="relative z-10 flex">
              {arr.map((val, idx) => {
                const inRange = step ? idx >= step.lo && idx <= step.hi : false;
                const isMid = step ? idx === step.mid : false;

                const cls = [
                  UI.cellBase,
                  "h-12 w-[72px] mx-1",
                  inRange ? UI.cellActive : UI.cellInactive,
                  isMid ? "ring-2 ring-white/60" : "",
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

        <div className={UI.hint}>
          Binary search rule: compare at <span className="font-semibold">mid</span>, then discard half.
        </div>
      </section>
    </VisualizerShell>
  );
}