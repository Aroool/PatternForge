"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import VisualizerShell from "@/lib/ui/VisualizerShell";
import { UI } from "@/lib/ui/styles";
import SpeedControl from "@/lib/ui/SpeedControl";
import TimelineScrubber from "@/lib/ui/TimeLineScrubber";

import { PatternRegistry } from "@/lib/engine/registry";
import { SubstringStep } from "@/lib/engine/patterns/substringWindow";

export default function SubstringWindowPage() {
  const pattern = PatternRegistry["substring-window"];

  const [sText, setSText] = useState("eceba");
  const [kText, setKText] = useState("2");

  const s = useMemo(() => sText ?? "", [sText]);
  const k = useMemo(() => {
    const n = Number(kText);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  }, [kText]);

  const steps = useMemo(
    () => pattern.buildSteps(s, k) as SubstringStep[],
    [s, k, pattern]
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

  // --- Visual geometry ---
  const cellWidth = 72;
  const baseX = 0;

  const leftX = step ? baseX + Math.max(0, step.l) * cellWidth : 0;
  const rightX =
    step && step.r >= 0 ? baseX + step.r * cellWidth : baseX;

  const windowWidth =
    step && step.r >= step.l && step.r >= 0
      ? (step.r - step.l + 1) * cellWidth
      : 0;

  const bestText =
    step && step.bestR >= step.bestL && step.bestR >= 0
      ? s.slice(step.bestL, step.bestR + 1)
      : "";

  const lineIdx = step ? pattern.activeLine(step) : 0;

  // ---------- Controls (same layout style as Binary) ----------
  const controls = (
    <div className="space-y-4">
      {/* Inputs row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className={UI.sectionTitle}>String</div>
          <input
            className={UI.input}
            value={sText}
            onChange={(e) => {
              setSText(e.target.value);
              setI(0);
              setPlaying(false);
            }}
            placeholder="eceba"
          />
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
            placeholder="2"
          />
        </div>
      </div>

      {/* Playback row + Speed */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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

        <SpeedControl
          value={speedMs}
          onChange={(val) => setSpeedMs(val)}
        />
      </div>

      {/* Timeline (full width) */}
      <TimelineScrubber
        total={steps.length}
        current={safeI}
        onChange={(index) => {
          setPlaying(false);
          setI(index);
        }}
      />

      {/* Status chips */}
      {step && (
        <div className="flex flex-wrap gap-3 pt-1">
          <div className={UI.chip}>l: {step.r >= 0 ? step.l : 0}</div>
          <div className={UI.chip}>r: {step.r}</div>
          <div className={UI.chip}>distinct: {step.distinct}</div>
          <div className={UI.chip}>k: {k}</div>
          <div className={UI.chip}>bestLen: {step.bestLen}</div>
        </div>
      )}

      {/* Note / banner */}
      {step && (
        <div className={`${UI.banner} mt-1`}>
          <div>{step.note}</div>
        </div>
      )}
    </div>
  );

  // ---------- Main Viz ----------
  const mainViz = (
    <div className="space-y-3">
      <div className={UI.sectionTitle}>String</div>

      <div className="relative overflow-x-auto">
        <div className="relative inline-block" style={{ paddingTop: 54, paddingBottom: 8 }}>
          {/* window highlight */}
          {step && step.r >= step.l && step.r >= 0 && (
            <motion.div
              className={UI.windowHighlight}
              animate={{ x: leftX, width: windowWidth }}
            />
          )}

          {/* pointer labels */}
          {step && step.r >= 0 && (
            <>
              <motion.div
                className="absolute top-1 text-xs font-semibold text-white/80"
                animate={{ x: leftX }}
                style={{ width: cellWidth }}
              >
                L
              </motion.div>

              <motion.div
                className="absolute top-1 text-xs font-semibold text-white/80 text-right"
                animate={{ x: rightX }}
                style={{ width: cellWidth }}
              >
                R
              </motion.div>
            </>
          )}

          {/* cells */}
          <div className="relative z-10 flex">
            {Array.from(s).map((ch, idx) => {
              const inWindow =
                step && step.r >= 0 ? idx >= step.l && idx <= step.r : false;

              const isAdded =
                step?.charAdded && step.r === idx;

              const cls = [
                UI.cellBase,
                "h-12 w-[72px] mx-1",
                inWindow ? UI.cellActive : UI.cellInactive,
                isAdded ? "ring-2 ring-white/60" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <motion.div
                  key={idx}
                  animate={{ opacity: step?.r >= 0 ? (inWindow ? 1 : 0.35) : 1 }}
                  className={cls}
                >
                  {ch === " " ? "␠" : ch}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Best box */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="text-sm font-medium text-white">Best window so far</div>
        <div className="text-sm text-neutral-300 mt-1">
          len: <span className="text-white font-semibold">{step?.bestLen ?? 0}</span>
          {" · "}
          idx:{" "}
          <span className="text-white font-semibold">
            {step ? `${step.bestL}..${step.bestR}` : "-"}
          </span>
        </div>
        <div className="text-sm text-neutral-300 mt-1">
          substring:{" "}
          <span className="text-white font-semibold">
            {bestText ? `"${bestText}"` : "—"}
          </span>
        </div>
      </div>
    </div>
  );

  // ---------- Code Panel ----------
  const side = (
    <div className="space-y-3">
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
              {line || " "}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <VisualizerShell
      title={pattern.name}
      subtitle="Longest substring with at most k distinct characters."
      controls={controls}
      side={side}
    >
      {mainViz}
    </VisualizerShell>
  );
}