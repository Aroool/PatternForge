"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UI } from "@/lib/ui/styles";

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

    steps.push({ l, r, sum, note: "Expand" });

    while (sum > k) {
      sum -= arr[l];
      l++;
      steps.push({ l, r, sum, note: "Shrink" });
    }
  }

  return steps;
}

export default function SlidingWindowPage() {
  const [arrText, setArrText] = useState("2,1,5,1,3,2");
  const [kText, setKText] = useState("7");

  const arr = useMemo(
    () =>
      arrText
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((n) => !isNaN(n)),
    [arrText]
  );

  const k = useMemo(() => Number(kText) || 0, [kText]);

  const steps = useMemo(() => buildSteps(arr, k), [arr, k]);

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  const step = steps[i];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setI((prev) => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(id);
  }, [playing, steps.length]);

  const cellWidth = 72;
  const leftX = step ? step.l * cellWidth : 0;

  return (
    <main className={UI.page}>
      <div className={UI.container}>
        <h1 className={UI.title}>Sliding Window (Sum ≤ k)</h1>

        <section className={`${UI.panel} ${UI.panelInner}`}>
          <input
            value={arrText}
            onChange={(e) => {
              setArrText(e.target.value);
              setI(0);
              setPlaying(false);
            }}
            className={UI.input}
          />
          <input
            value={kText}
            onChange={(e) => {
              setKText(e.target.value);
              setI(0);
              setPlaying(false);
            }}
            className={UI.input}
          />

          <div className="flex gap-2">
            <button
              className={UI.btnPrimary}
              onClick={() => setPlaying(true)}
            >
              Play
            </button>
            <button
              className={UI.btnGhost}
              onClick={() => setPlaying(false)}
            >
              Pause
            </button>
          </div>

          {step && (
            <div className={UI.banner}>
              sum = {step.sum} / k = {k}
            </div>
          )}
        </section>

        <section className={`${UI.panel} ${UI.panelInner}`}>
          <div className="relative inline-block pt-10">
            {step && (
              <motion.div
                className={UI.windowHighlight}
                animate={{
                  x: leftX,
                  width: (step.r - step.l + 1) * cellWidth,
                }}
              />
            )}

            <div className="relative z-10 flex">
              {arr.map((num, idx) => {
                const inWindow =
                  step && idx >= step.l && idx <= step.r;
                return (
                  <div
                    key={idx}
                    className={`h-12 w-[72px] ${UI.cellBase} ${
                      inWindow ? UI.cellActive : UI.cellInactive
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}