export type BinaryVariant =
  | "standard"
  | "first"
  | "last"
  | "lower_bound"
  | "upper_bound";

export type BinaryStep = {
  lo: number;
  mid: number;
  hi: number;

  // helpful UI fields
  decision:
    | "init"
    | "go_left"
    | "go_right"
    | "found"
    | "record_ans"
    | "done";
  note: string;

  // current best answer (for variants that keep searching)
  ansIndex: number | null;

  // final output when done
  resultIndex: number | null;
};

export const BinarySearchPattern = {
  id: "binary-search",
  name: "Binary Search",

  // used by your code panel
  codeLines: [
    "lo = 0, hi = n-1",
    "while lo <= hi:",
    "  mid = (lo+hi)//2",
    "  if a[mid] == target: ...",
    "  elif a[mid] < target: lo = mid + 1",
    "  else: hi = mid - 1",
    "return ans",
  ],

  // tells UI which line to highlight
  activeLine(step: BinaryStep) {
    switch (step.decision) {
      case "init":
        return 0;
      case "go_left":
      case "go_right":
      case "found":
      case "record_ans":
        return 2;
      case "done":
        return 6;
      default:
        return 2;
    }
  },

  buildSteps(
    arr: number[],
    target: number,
    opts?: { variant?: BinaryVariant }
  ): BinaryStep[] {
    const variant: BinaryVariant = opts?.variant ?? "standard";
    const steps: BinaryStep[] = [];

    if (!arr.length) return steps;

    let lo = 0;
    let hi = arr.length - 1;

    // for variants that keep searching
    let ans: number | null = null;

    steps.push({
      lo,
      hi,
      mid: Math.floor((lo + hi) / 2),
      decision: "init",
      note: `Start: lo=${lo}, hi=${hi}, variant=${variant}`,
      ansIndex: ans,
      resultIndex: null,
    });

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const v = arr[mid];

      // ---- STANDARD / FIRST / LAST ----
      if (variant === "standard" || variant === "first" || variant === "last") {
        if (v === target) {
          if (variant === "standard") {
            steps.push({
              lo,
              hi,
              mid,
              decision: "found",
              note: `Found target at mid=${mid}. Stop.`,
              ansIndex: mid,
              resultIndex: mid,
            });
            return steps;
          }

          // first/last keep searching
          ans = mid;
          steps.push({
            lo,
            hi,
            mid,
            decision: "record_ans",
            note:
              variant === "first"
                ? `Found at mid=${mid}. Record ans, go LEFT to find first occurrence.`
                : `Found at mid=${mid}. Record ans, go RIGHT to find last occurrence.`,
            ansIndex: ans,
            resultIndex: null,
          });

          if (variant === "first") {
            hi = mid - 1;
          } else {
            lo = mid + 1;
          }
          continue;
        }

        if (v < target) {
          steps.push({
            lo,
            hi,
            mid,
            decision: "go_right",
            note: `a[mid]=${v} < ${target}. Move lo = mid + 1`,
            ansIndex: ans,
            resultIndex: null,
          });
          lo = mid + 1;
        } else {
          steps.push({
            lo,
            hi,
            mid,
            decision: "go_left",
            note: `a[mid]=${v} > ${target}. Move hi = mid - 1`,
            ansIndex: ans,
            resultIndex: null,
          });
          hi = mid - 1;
        }

        continue;
      }

      // ---- LOWER_BOUND (first index with a[i] >= target) ----
      if (variant === "lower_bound") {
        if (v >= target) {
          ans = mid;
          steps.push({
            lo,
            hi,
            mid,
            decision: "record_ans",
            note: `a[mid]=${v} >= ${target}. Record ans=${mid}, go LEFT (hi = mid - 1)`,
            ansIndex: ans,
            resultIndex: null,
          });
          hi = mid - 1;
        } else {
          steps.push({
            lo,
            hi,
            mid,
            decision: "go_right",
            note: `a[mid]=${v} < ${target}. Go RIGHT (lo = mid + 1)`,
            ansIndex: ans,
            resultIndex: null,
          });
          lo = mid + 1;
        }
        continue;
      }

      // ---- UPPER_BOUND (first index with a[i] > target) ----
      if (variant === "upper_bound") {
        if (v > target) {
          ans = mid;
          steps.push({
            lo,
            hi,
            mid,
            decision: "record_ans",
            note: `a[mid]=${v} > ${target}. Record ans=${mid}, go LEFT (hi = mid - 1)`,
            ansIndex: ans,
            resultIndex: null,
          });
          hi = mid - 1;
        } else {
          steps.push({
            lo,
            hi,
            mid,
            decision: "go_right",
            note: `a[mid]=${v} <= ${target}. Go RIGHT (lo = mid + 1)`,
            ansIndex: ans,
            resultIndex: null,
          });
          lo = mid + 1;
        }
        continue;
      }
    }

    // done
    steps.push({
      lo,
      hi,
      mid: -1,
      decision: "done",
      note:
        variant === "standard"
          ? `Done. Not found.`
          : `Done. Best answer index = ${ans === null ? "null" : ans}.`,
      ansIndex: ans,
      resultIndex: ans,
    });

    return steps;
  },
};