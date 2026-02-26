"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import VisualizerShell from "@/lib/ui/VisualizerShell";
import { UI } from "@/lib/ui/styles";
import SpeedControl from "@/lib/ui/SpeedControl";
import TimelineScrubber from "@/lib/ui/TimeLineScrubber";

import { PatternRegistry } from "@/lib/engine/registry";
import { BinaryStep } from "@/lib/engine/patterns/binarySearch";

function parseArray(text: string): number[] {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

export default function BinarySearchPage() {
  const pattern = PatternRegistry["binary-search"];

  const [arrText, setArrText] = useState("1,3,5,7,9,11,13,15"); 
  const [targetText, setTargetText] = useState("9");

  const arr = useMemo(() => parseArray(arrText), [arrText]);
  const target = useMemo(() => {
    const n = Number(targetText);
    return Number.isFinite(n) ? n : 0;
  }, [targetText]);

  const steps = useMemo(
    () => pattern.buildSteps(arr, target) as BinaryStep[],
    [arr, target, pattern]
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

  // Animation geometry
  const cellWidth = 72;
  const baseX = 0;

  const loX = step ? baseX + step.lo * cellWidth : 0;
  const hiX = step ? baseX + step.hi * cellWidth : 0;
  const midX = step && step.mid >= 0 ? baseX + step.mid * cellWidth : 0;

  const rangeWidth =
    step && step.hi >= step.lo ? (step.hi - step.lo + 1) * cellWidth : 0;

  const lineIdx = step ? pattern.activeLine(step) : 0;

  // ---------- Controls ----------
  const controls = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <div className={UI.sectionTitle}>Sorted array</div>
          <input
            className={UI.input}
            value={arrText}
            onChange={(e) => {
              setArrText(e.target.value);
              setI(0);
              setPlaying(false);
            }}
          />
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

          <div className="flex items-center justify-between pt-2">
  <SpeedControl
    value={speedMs}
    onChange={(val) => {
      setSpeedMs(val);
    }}
  />
</div>
<TimelineScrubber
  total={steps.length}
  current={safeI}
  onChange={(index) => {
    setPlaying(false);
    setI(index);
  }}
/>
        </div>
      </div>

      {/* Status chips */}
      {step && (
        <div className="flex flex-wrap gap-3 pt-2">
          <div className={UI.chip}>lo: {step.lo}</div>
          <div className={UI.chip}>mid: {step.mid}</div>
          <div className={UI.chip}>hi: {step.hi}</div>
          {step.foundIndex !== null && (
            <div className={UI.chip}>
              foundIndex: {step.foundIndex}
            </div>
          )}
        </div>
      )}

      {step && (
        <div className={`${UI.banner} mt-2`}>
          <div>{step.note}</div>
        </div>
      )}
    </>
  );

  // ---------- Main Viz ----------
  const mainViz = (
    <>
      <div className={UI.sectionTitle}>Array</div>

      <div className="relative overflow-x-auto">
        <div className="relative inline-block" style={{ paddingTop: 54 }}>
          {step && step.hi >= step.lo && (
            <motion.div
              className={UI.windowHighlight}
              animate={{ x: loX, width: rangeWidth }}
            />
          )}

          <div className="relative z-10 flex">
            {arr.map((val, idx) => {
              const inRange =
                step && idx >= step.lo && idx <= step.hi;
              const isMid = step && idx === step.mid;
              const isFound =
                step?.decision === "found" && isMid;

              return (
                <motion.div
                  key={idx}
                  animate={{ opacity: inRange ? 1 : 0.25 }}
                  className={[
                    UI.cellBase,
                    "h-12 w-[72px] mx-1",
                    inRange ? UI.cellActive : UI.cellInactive,
                    isMid ? "ring-2 ring-white/60" : "",
                    isFound
                      ? "bg-emerald-400/20 border-emerald-300/50"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {val}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  // ---------- Code Panel ----------
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
                active
                  ? "bg-white/10 text-white"
                  : "text-neutral-300",
              ].join(" ")}
            >
              <span className="text-neutral-500 mr-3">
                {idx + 1}
              </span>
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
      subtitle="Binary Search powered by PatternEngine."
      controls={controls}
      side={side}
    >
      {mainViz}
    </VisualizerShell>
  );
}