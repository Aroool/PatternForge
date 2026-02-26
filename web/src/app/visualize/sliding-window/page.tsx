"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import VisualizerShell from "@/lib/ui/VisualizerShell";
import { UI } from "@/lib/ui/styles";
import SpeedControl from "@/lib/ui/SpeedControl";
import TimelineScrubber from "@/lib/ui/TimeLineScrubber";

import { PatternRegistry } from "@/lib/engine/registry";
import type { SlidingStep } from "@/lib/engine/patterns/slidingWindow";

function parseArray(text: string): number[] {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

export default function SlidingWindowPage() {
  const pattern = PatternRegistry["sliding-window"];

  const [arrText, setArrText] = useState("2,1,5,1,3,2");
  const [kText, setKText] = useState("7");

  const arr = useMemo(() => parseArray(arrText), [arrText]);
  const k = useMemo(() => {
    const n = Number(kText);
    return Number.isFinite(n) ? n : 0;
  }, [kText]);

  const steps = useMemo(
    () => pattern.buildSteps(arr, k) as SlidingStep[],
    [arr, k, pattern]
  );

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

  // geometry
  const cellWidth = 72;
  const baseX = 0;

  const leftX = step ? baseX + step.l * cellWidth : 0;
  const rightX = step ? baseX + step.r * cellWidth : 0;

  const windowWidth =
    step && step.r >= step.l ? (step.r - step.l + 1) * cellWidth : 0;

  const lineIdx = step ? pattern.activeLine(step) : 0;

  // Controls block (same structure as Binary)
  const controls = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className={UI.sectionTitle}>Array (comma separated)</div>
          <input
            className={UI.input}
            value={arrText}
            onChange={(e) => {
              setArrText(e.target.value);
              setPlaying(false);
              setI(0);
            }}
          />
        </div>

        <div className="space-y-1">
          <div className={UI.sectionTitle}>k</div>
          <input
            className={UI.input}
            value={kText}
            onChange={(e) => {
              setKText(e.target.value);
              setPlaying(false);
              setI(0);
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap pt-3">
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

        <SpeedControl value={speedMs} onChange={setSpeedMs} />
      </div>

      <div className="pt-3">
        <TimelineScrubber
          total={steps.length}
          current={safeI}
          onChange={(index) => {
            setPlaying(false);
            setI(index);
          }}
        />
      </div>

      {/* Status chips */}
      {step && (
        <div className="flex flex-wrap gap-3 pt-3">
          <div className={UI.chip}>l: {step.l}</div>
          <div className={UI.chip}>r: {step.r}</div>
          <div className={UI.chip}>sum: {step.sum}</div>
          <div className={UI.chip}>k: {step.k}</div>
        </div>
      )}

      {step && (
        <div className={`${UI.banner} mt-3`}>
          <div className="font-medium">
            {step.valid ? "✅ Valid window" : "❌ Invalid window"}
          </div>
          <div className="text-neutral-200">{step.note}</div>
        </div>
      )}
    </>
  );

  // Main visualization
  const mainViz = (
    <>
      <div className={UI.sectionTitle}>Array</div>

      <div className="relative overflow-x-auto">
        {/* IMPORTANT: extra padding so highlight doesn't clip */}
        <div className="relative inline-block" style={{ paddingTop: 54, paddingBottom: 22 }}>
          {/* highlight BEHIND cells (no blur here) */}
          {step && step.r >= step.l && (
            <motion.div
              className={UI.windowHighlight}
              initial={false}
              animate={{ x: leftX, width: windowWidth }}
            />
          )}

          {/* pointer labels */}
          {step && (
            <>
              <motion.div
                className="absolute top-0 text-xs font-semibold text-white/80"
                initial={false}
                animate={{ x: leftX }}
                style={{ width: cellWidth }}
              >
                L
              </motion.div>

              <motion.div
                className="absolute top-0 text-xs font-semibold text-right text-white/80"
                initial={false}
                animate={{ x: rightX }}
                style={{ width: cellWidth }}
              >
                R
              </motion.div>
            </>
          )}

          <div className="relative z-10 flex">
            {arr.map((val, idx) => {
              const inWindow = step ? idx >= step.l && idx <= step.r : false;

              return (
                <div
                  key={idx}
                  className={[
                    UI.cellBase,
                    "h-12 w-[72px] mx-1",
                    inWindow ? UI.cellActive : UI.cellInactive,
                  ].join(" ")}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Best window (optional) */}
      {step && step.bestR >= step.bestL && step.bestR >= 0 && (
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="text-sm font-medium text-white">Best window so far</div>
          <div className="text-sm text-neutral-300 mt-1">
            len: <span className="text-white font-semibold">{step.bestLen}</span>{" "}
            · indices:{" "}
            <span className="text-white font-semibold">
              {step.bestL}..{step.bestR}
            </span>
          </div>
        </div>
      )}
    </>
  );

  // Code panel
  const side = (
    <>
      <div className={UI.sectionTitle}>Code</div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        {pattern.codeLines.map((line, idx) => {
          const active = idx === lineIdx;
          return (
            <div
              key={idx}
              className={[
                "px-3 py-2 text-sm font-mono border-b border-neutral-800 last:border-b-0",
                active ? "bg-white/10 text-white" : "text-neutral-300",
              ].join(" ")}
            >
              <span className="text-neutral-500 mr-3">{idx + 1}</span>
              {line}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <VisualizerShell
      title={pattern.name}
      subtitle="Sliding Window powered by PatternEngine."
      controls={controls}
      side={side}
    >
      {mainViz}
    </VisualizerShell>
  );
}