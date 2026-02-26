// src/lib/engine/registry.ts
import { BinarySearchPattern } from "./patterns/binarySearch";
import { SlidingWindowPattern } from "./patterns/slidingWindow";

export const PatternRegistry = {
  "binary-search": BinarySearchPattern,
  "sliding-window": SlidingWindowPattern,
} as const;