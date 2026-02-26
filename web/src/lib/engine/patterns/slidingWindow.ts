// src/lib/engine/patterns/slidingWindow.ts
export type SlidingStep = {
  l: number;
  r: number;
  sum: number;
  k: number;
  valid: boolean;
  note: string;

  // for “best window so far” (optional, but nice)
  bestLen: number;
  bestL: number;
  bestR: number;

  // helps code-highlighting
  phase:
    | "init"
    | "expand_add"
    | "while_check"
    | "shrink_remove"
    | "after_shrink"
    | "update_best"
    | "done";
};

type Pattern = {
  key: string;
  name: string;
  codeLines: string[];
  buildSteps: (arr: number[], k: number) => SlidingStep[];
  activeLine: (step: SlidingStep) => number; // 0-based index into codeLines
};

function clampK(n: number) {
  return Number.isFinite(n) ? n : 0;
}

/**
 * Demo pattern:
 * Maintain a window where sum <= k
 * Typical: "smallest subarray length with sum >= k" is different;
 * we’re using the SAME logic you already built (sum<=k).
 */
function buildSteps(arr: number[], rawK: number): SlidingStep[] {
  const steps: SlidingStep[] = [];
  const k = clampK(rawK);

  if (!arr.length) return steps;

  let l = 0;
  let sum = 0;

  let bestLen = 0;
  let bestL = 0;
  let bestR = -1;

  steps.push({
    l,
    r: -1,
    sum,
    k,
    valid: true,
    note: `Init: l=0, sum=0`,
    bestLen,
    bestL,
    bestR,
    phase: "init",
  });

  for (let r = 0; r < arr.length; r++) {
    sum += arr[r];

    steps.push({
      l,
      r,
      sum,
      k,
      valid: sum <= k,
      note: `Expand: add arr[${r}]=${arr[r]} → sum=${sum}`,
      bestLen,
      bestL,
      bestR,
      phase: "expand_add",
    });

    // shrink while invalid
    while (sum > k && l <= r) {
      steps.push({
        l,
        r,
        sum,
        k,
        valid: false,
        note: `Invalid: sum=${sum} > k=${k}. Shrink from left.`,
        bestLen,
        bestL,
        bestR,
        phase: "while_check",
      });

      const removed = arr[l];
      sum -= removed;
      l++;

      steps.push({
        l,
        r,
        sum,
        k,
        valid: sum <= k,
        note: `Shrink: remove ${removed}. l=${l}, sum=${sum}`,
        bestLen,
        bestL,
        bestR,
        phase: "shrink_remove",
      });
    }

    steps.push({
      l,
      r,
      sum,
      k,
      valid: sum <= k,
      note: `Window valid: [${l}..${r}] sum=${sum}`,
      bestLen,
      bestL,
      bestR,
      phase: "after_shrink",
    });

    // optional “best window so far” (longest valid window)
    // if you prefer something else, we can change later.
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
          k,
          valid: true,
          note: `New best: [${bestL}..${bestR}] len=${bestLen}`,
          bestLen,
          bestL,
          bestR,
          phase: "update_best",
        });
      }
    }
  }

  steps.push({
    l,
    r: arr.length - 1,
    sum,
    k,
    valid: sum <= k,
    note: "Done.",
    bestLen,
    bestL,
    bestR,
    phase: "done",
  });

  return steps;
}

const codeLines = [
  "l = 0; sum = 0",
  "for r in [0..n-1]:",
  "  sum += arr[r]",
  "  while sum > k:",
  "    sum -= arr[l]; l += 1",
  "  window is valid (sum <= k)",
  "  update best window (optional)",
];

function activeLine(step: SlidingStep): number {
  switch (step.phase) {
    case "init":
      return 0;
    case "expand_add":
      return 2;
    case "while_check":
      return 3;
    case "shrink_remove":
      return 4;
    case "after_shrink":
      return 5;
    case "update_best":
      return 6;
    case "done":
      return 5;
    default:
      return 0;
  }
}

export const SlidingWindowPattern: Pattern = {
  key: "sliding-window",
  name: "Sliding Window",
  codeLines,
  buildSteps,
  activeLine,
};