// src/lib/engine/patterns/substringWindow.ts

export type SubstringStep = {
  l: number;
  r: number;
  k: number;

  // freq + distinct
  freq: Record<string, number>;
  distinct: number;
  valid: boolean;

  // optional for UI hints
  charAdded?: string;
  charRemoved?: string;

  // best window so far
  bestLen: number;
  bestL: number;
  bestR: number;

  note: string;

  // code-highlighting
  phase:
    | "init"
    | "expand_add"
    | "while_check"
    | "shrink_remove"
    | "update_best"
    | "done";
};

type Pattern = {
  key: string;
  name: string;
  codeLines: string[];
  buildSteps: (s: string, k: number) => SubstringStep[];
  activeLine: (step: SubstringStep) => number; // 0-based index into codeLines
};

function clampK(k: number) {
  if (!Number.isFinite(k)) return 0;
  return Math.max(0, Math.floor(k));
}

function cloneFreq(freq: Record<string, number>) {
  return { ...freq };
}

function distinctCount(freq: Record<string, number>) {
  return Object.keys(freq).length;
}

export const SubstringWindowPattern: Pattern = {
  key: "substring-window",
  name: "Substring Window",
  codeLines: [
    "l = 0",
    "freq = {}",
    "best = 0",
    "",
    "for r in range(n):",
    "  add s[r] to freq",
    "  while distinct(freq) > k:",
    "    remove s[l] from freq",
    "    l += 1",
    "  best = max(best, r-l+1)",
  ],

  buildSteps: (sRaw: string, kRaw: number): SubstringStep[] => {
    const s = sRaw ?? "";
    const k = clampK(kRaw);

    const steps: SubstringStep[] = [];
    const n = s.length;
    if (n === 0) return steps;

    let l = 0;
    const freq: Record<string, number> = {};

    let bestLen = 0;
    let bestL = 0;
    let bestR = -1;

    // init
    steps.push({
      l,
      r: -1,
      k,
      freq: cloneFreq(freq),
      distinct: 0,
      valid: true,
      bestLen,
      bestL,
      bestR,
      note: "Init: l=0, freq={}, best=0",
      phase: "init",
    });

    for (let r = 0; r < n; r++) {
      const ch = s[r];
      freq[ch] = (freq[ch] ?? 0) + 1;

      let d = distinctCount(freq);
      let valid = d <= k;

      // after expand
      steps.push({
        l,
        r,
        k,
        charAdded: ch,
        freq: cloneFreq(freq),
        distinct: d,
        valid,
        bestLen,
        bestL,
        bestR,
        note: `Expand: add '${ch}' at r=${r}. distinct=${d} (k=${k}).`,
        phase: "expand_add",
      });

      // shrink while invalid
      while (d > k && l <= r) {
        steps.push({
          l,
          r,
          k,
          freq: cloneFreq(freq),
          distinct: d,
          valid: false,
          bestLen,
          bestL,
          bestR,
          note: `Check: distinct=${d} > k=${k}. Need shrink.`,
          phase: "while_check",
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
          k,
          charRemoved: leftChar,
          freq: cloneFreq(freq),
          distinct: d,
          valid,
          bestLen,
          bestL,
          bestR,
          note: `Shrink: remove '${leftChar}', l=${l}. distinct=${d} (k=${k}).`,
          phase: "shrink_remove",
        });
      }

      // update best (only when valid)
      if (valid) {
        const len = r - l + 1;
        const improved = len > bestLen;

        if (improved) {
          bestLen = len;
          bestL = l;
          bestR = r;
        }

        steps.push({
          l,
          r,
          k,
          freq: cloneFreq(freq),
          distinct: d,
          valid: true,
          bestLen,
          bestL,
          bestR,
          note: improved
            ? `Update best: new best [${bestL}..${bestR}] len=${bestLen}.`
            : `Update best: window [${l}..${r}] len=${len}, best=${bestLen}.`,
          phase: "update_best",
        });
      }
    }

    steps.push({
      l,
      r: n - 1,
      k,
      freq: cloneFreq(freq),
      distinct: distinctCount(freq),
      valid: distinctCount(freq) <= k,
      bestLen,
      bestL,
      bestR,
      note: `Done. Best window [${bestL}..${bestR}] len=${bestLen}.`,
      phase: "done",
    });

    return steps;
  },

  activeLine: (step: SubstringStep) => {
    // Map phases to codeLines index (0-based)
    switch (step.phase) {
      case "init":
        return 0; // l=0
      case "expand_add":
        return 5; // add s[r]
      case "while_check":
        return 6; // while distinct > k
      case "shrink_remove":
        return 7; // remove s[l]
      case "update_best":
        return 9; // best = max(...)
      case "done":
        return 9;
      default:
        return 0;
    }
  },
};