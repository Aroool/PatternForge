// src/lib/engine/patterns/slidingWindow.ts

export type SlidingStep = {
  l: number;
  r: number;
  sum: number;
  k: number;
  valid: boolean;
  note: string;

  // best window so far (max length while sum <= k)
  bestLen: number;
  bestL: number;
  bestR: number;

  // for code highlighting
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
  subtitle: string;
  codeLines: string[];
  buildSteps: (arr: number[], k: number) => SlidingStep[];
  activeLine: (step: SlidingStep) => number; // 0-based index into codeLines
};

function clampNumber(n: number, fallback = 0) {
  return Number.isFinite(n) ? n : fallback;
}

export const SlidingWindowPattern: Pattern = {
  key: "sliding-window",
  name: "Sliding Window",
  subtitle: "Maintain a window where sum ≤ k (shrink when invalid).",

  codeLines: [
    "l = 0",
    "sum = 0",
    "best = 0",
    "for r in range(n):",
    "  sum += a[r]",
    "  while sum > k:",
    "    sum -= a[l]",
    "    l += 1",
    "  best = max(best, r-l+1)",
  ],

  buildSteps: (arr, kRaw) => {
    const steps: SlidingStep[] = [];
    const k = clampNumber(kRaw, 0);

    if (!arr.length) return steps;

    let l = 0;
    let sum = 0;

    let bestLen = 0;
    let bestL = 0;
    let bestR = -1;

    // init snapshot
    steps.push({
      l,
      r: -1,
      sum,
      k,
      valid: true,
      note: "Init: l=0, sum=0, best=0",
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
        note: `Expand: add a[${r}]=${arr[r]} → sum=${sum}`,
        bestLen,
        bestL,
        bestR,
        phase: "expand_add",
      });

      // while check snapshot (so code highlight feels real)
      steps.push({
        l,
        r,
        sum,
        k,
        valid: sum <= k,
        note: `Check: sum=${sum} ${sum <= k ? "≤" : ">"} k=${k}`,
        bestLen,
        bestL,
        bestR,
        phase: "while_check",
      });

      while (sum > k && l <= r) {
        const removed = arr[l];
        sum -= removed;
        l++;

        steps.push({
          l,
          r,
          sum,
          k,
          valid: sum <= k,
          note: `Shrink: remove left (${removed}) → l=${l}, sum=${sum}`,
          bestLen,
          bestL,
          bestR,
          phase: "shrink_remove",
        });

        steps.push({
          l,
          r,
          sum,
          k,
          valid: sum <= k,
          note: `After shrink: sum=${sum} ${sum <= k ? "≤" : ">"} k=${k}`,
          bestLen,
          bestL,
          bestR,
          phase: "after_shrink",
        });
      }

      // update best (only if valid)
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
        } else {
          steps.push({
            l,
            r,
            sum,
            k,
            valid: true,
            note: `Valid window: [${l}..${r}] len=${len} (best=${bestLen})`,
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
  },

  activeLine: (step) => {
    // Map “phase” -> which code line should glow
    switch (step.phase) {
      case "init":
        return 0; // l = 0
      case "expand_add":
        return 4; // sum += a[r]
      case "while_check":
        return 5; // while sum > k:
      case "shrink_remove":
        return 6; // sum -= a[l]
      case "after_shrink":
        return 7; // l += 1
      case "update_best":
        return 8; // best = max(...)
      case "done":
      default:
        return 8;
    }
  },
};