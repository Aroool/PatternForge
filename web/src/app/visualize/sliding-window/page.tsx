"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Step = {
  l: number;
  r: number;
  sum: number;
  note: string;
};

function buildSteps(arr: number[], k: number): Step[] {
  const steps: Step[] = [];
  let l = 0;
  let sum = 0;

  for (let r = 0; r < arr.length; r++) {
    sum += arr[r];
    steps.push({ l, r, sum, note: `Expand: add arr[${r}]=${arr[r]} → sum=${sum}` });

    while (sum > k && l <= r) {
      steps.push({ l, r, sum, note: `Invalid (sum>${k}). Shrink left.` });
      sum -= arr[l];
      l++;
      steps.push({ l, r, sum, note: `Shrink: remove left → l=${l}, sum=${sum}` });
    }

    steps.push({ l, r, sum, note: `Window valid: [${l}..${r}] sum=${sum}` });
  }

  return steps;
}

export default function SlidingWindowVisualizerPage() {
  const [arrText, setArrText] = useState("2,1,5,1,3,2");
  const [kText, setKText] = useState("7");

  const arr = useMemo(() => {
    return arrText
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n));
  }, [arrText]);

  const k = useMemo(() => {
    const n = Number(kText);
    return Number.isFinite(n) ? n : 0;
  }, [kText]);

  const steps = useMemo(() => buildSteps(arr, k), [arr, k]);

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, Math.max(steps.length - 1, 0))];

  const [playing, setPlaying] = useState(false);

  // simple play loop (no fancy timers in hooks to keep it beginner-friendly)
  const onPlay = () => {
    setPlaying(true);
    const id = setInterval(() => {
      setI((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(id);
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, 650);
  };

  const onPause = () => setPlaying(false);

  // Stop interval when paused by simply reloading it via button press.
  // (Later we can convert to useEffect timer; this is simplest and safe.)

  const cellWidth = 72; // px
  const baseX = 0;

  const leftX = step ? baseX + step.l * cellWidth : 0;
  const rightX = step ? baseX + step.r * cellWidth : 0;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl p-6 md:p-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Sliding Window Visualizer</h1>
          <p className="text-sm md:text-base text-neutral-600">
            Demo problem: Maintain a window where <span className="font-semibold">sum ≤ k</span>.
          </p>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Array (comma separated)</div>
              <input
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-300"
                value={arrText}
                onChange={(e) => {
                  setArrText(e.target.value);
                  setI(0);
                  setPlaying(false);
                }}
              />
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
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Playback</div>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-40"
                  disabled={steps.length === 0 || playing}
                  onClick={onPlay}
                >
                  Play
                </button>
                <button
                  className="rounded-xl px-4 py-2 border disabled:opacity-40"
                  disabled={!playing}
                  onClick={onPause}
                >
                  Pause
                </button>
                <button
                  className="rounded-xl px-4 py-2 border disabled:opacity-40"
                  disabled={steps.length === 0 || i === 0}
                  onClick={() => {
                    setPlaying(false);
                    setI((x) => Math.max(0, x - 1));
                  }}
                >
                  Prev
                </button>
                <button
                  className="rounded-xl px-4 py-2 border disabled:opacity-40"
                  disabled={steps.length === 0 || i >= steps.length - 1}
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

          {/* Status */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-full border px-3 py-1">
              Step: <span className="font-semibold">{steps.length ? i + 1 : 0}</span> /{" "}
              <span className="font-semibold">{steps.length}</span>
            </div>
            <div className="rounded-full border px-3 py-1">
              l: <span className="font-semibold">{step?.l ?? "-"}</span>
            </div>
            <div className="rounded-full border px-3 py-1">
              r: <span className="font-semibold">{step?.r ?? "-"}</span>
            </div>
            <div className="rounded-full border px-3 py-1">
              sum: <span className="font-semibold">{step?.sum ?? "-"}</span>
            </div>
            <div className="rounded-full border px-3 py-1">
              k: <span className="font-semibold">{k}</span>
            </div>
          </div>

          {/* Note */}
          <div className="text-sm text-neutral-700">
            <span className="font-medium">Note:</span> {step?.note ?? "—"}
          </div>
        </section>

        {/* Visualization */}
        <section className="rounded-2xl border p-5 md:p-6 space-y-4">
          <div className="text-sm font-medium">Array</div>

          <div className="relative overflow-x-auto">
            <div className="relative inline-block" style={{ paddingTop: 44 }}>
              {/* Window highlight */}
              {step && (
                <motion.div
                  className="absolute top-8 h-12 rounded-xl border bg-neutral-100/70"
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
                {arr.map((val, idx) => {
                  const inWindow = step ? idx >= step.l && idx <= step.r : false;
                  return (
                    <div
                      key={idx}
                      className={[
                        "h-12 w-[72px] flex items-center justify-center border rounded-xl mx-1 text-sm font-medium",
                        inWindow ? "bg-white" : "bg-transparent",
                      ].join(" ")}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-xs text-neutral-500">
            Tip: Try different arrays/k. Watch how L shrinks when sum goes above k.
          </div>
        </section>
      </div>
    </main>
  );
}