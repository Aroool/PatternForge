import { PatternDefinition, BaseStep } from "../types";

export type BinaryDecision =
  | "start"
  | "go_left"
  | "go_right"
  | "found"
  | "not_found";

export type BinaryStep = BaseStep & {
  lo: number;
  hi: number;
  mid: number;
  midVal: number | null;
  foundIndex: number | null;
};

const codeLines = [
  "lo = 0, hi = n-1",
  "while lo <= hi:",
  "  mid = (lo+hi)//2",
  "  if a[mid] == target: return mid",
  "  elif a[mid] < target: lo = mid + 1",
  "  else: hi = mid - 1",
  "return -1",
];

function buildSteps(arr: number[], target: number): BinaryStep[] {
  const steps: BinaryStep[] = [];

  if (!arr.length) {
    steps.push({
      lo: 0,
      hi: -1,
      mid: -1,
      midVal: null,
      decision: "not_found",
      note: "Array empty.",
      foundIndex: null,
    });
    return steps;
  }

  let lo = 0;
  let hi = arr.length - 1;

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
        note: `Found at index ${mid}`,
        foundIndex: mid,
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
        note: "Discard left half",
        foundIndex: null,
      });
      lo = mid + 1;
    } else {
      steps.push({
        lo,
        hi,
        mid,
        midVal,
        decision: "go_left",
        note: "Discard right half",
        foundIndex: null,
      });
      hi = mid - 1;
    }
  }

  steps.push({
    lo,
    hi,
    mid: -1,
    midVal: null,
    decision: "not_found",
    note: "Not found",
    foundIndex: null,
  });

  return steps;
}

function activeLine(step: BinaryStep): number {
  switch (step.decision) {
    case "found":
      return 3;
    case "go_right":
      return 4;
    case "go_left":
      return 5;
    case "not_found":
      return 6;
    default:
      return 2;
  }
}

export const BinarySearchPattern: PatternDefinition<BinaryStep> = {
  id: "binary-search",
  name: "Binary Search",
  codeLines,
  buildSteps,
  activeLine,
}; 