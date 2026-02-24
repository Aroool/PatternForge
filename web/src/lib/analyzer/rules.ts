export type RuleType = "keyword" | "regex";

export type Rule = {
  id: string;
  type: RuleType;
  value: string;
  weight: number;
  reason: string;
};

export type PatternDef = {
  id: string;
  name: string;
  maxScoreHint: number;
  rules: Rule[];
};

export const PATTERNS: PatternDef[] = [
  {
    id: "sliding_window",
    name: "Sliding Window",
    maxScoreHint: 18,
    rules: [
      { id: "sw_subarray", type: "keyword", value: "subarray", weight: 5, reason: "Mentions subarray → contiguous segment problems often fit sliding window." },
      { id: "sw_substring", type: "keyword", value: "substring", weight: 5, reason: "Mentions substring → classic signal for a window over a string." },
      { id: "sw_contiguous", type: "keyword", value: "contiguous", weight: 4, reason: "Uses 'contiguous' → strongly points to expanding/shrinking a window." },
      { id: "sw_longest", type: "regex", value: "\\blongest\\b|\\bmaximum length\\b", weight: 4, reason: "Asks for longest/max length under a condition → typical sliding window goal." },
      { id: "sw_shortest", type: "regex", value: "\\bshortest\\b|\\bminimum window\\b|\\bmin window\\b", weight: 4, reason: "Asks for shortest/min window → direct sliding window indicator." },
      { id: "sw_atmost_exactly", type: "regex", value: "\\bat most\\b|\\bat least\\b|\\bexactly\\b|\\bno more than\\b", weight: 4, reason: "Phrases like at most/exactly → maintain condition and adjust pointers." },
      { id: "sw_k_distinct", type: "regex", value: "\\bk distinct\\b|\\bdistinct characters\\b|\\bdistinct elements\\b", weight: 4, reason: "K distinct constraint → sliding window + frequency map is standard." },
    ],
  },

  {
    id: "two_pointers",
    name: "Two Pointers",
    maxScoreHint: 16,
    rules: [
      { id: "tp_sorted", type: "keyword", value: "sorted", weight: 6, reason: "Sorted input → two pointers can scan from both ends in O(n)." },
      { id: "tp_two_sum", type: "regex", value: "\\btwo sum\\b|\\bpairs?\\b|\\btriplet\\b|\\btarget\\b", weight: 4, reason: "Find pair/triplet with a target → commonly solved with two pointers (after sorting)." },
      { id: "tp_palindrome", type: "keyword", value: "palindrome", weight: 5, reason: "Palindrome check uses left/right pointers moving inward." },
      { id: "tp_inplace", type: "regex", value: "\\bin-place\\b|\\bwithout extra space\\b|\\bO\\(1\\) extra space\\b", weight: 3, reason: "In-place/O(1) extra space hints → pointers to rearrange without extra memory." },
    ],
  },

  {
    id: "hashmap_counting",
    name: "Hash Map / Frequency Counting",
    maxScoreHint: 16,
    rules: [
      { id: "hm_frequency", type: "keyword", value: "frequency", weight: 6, reason: "Mentions frequency → hash map counting is the natural tool." },
      { id: "hm_count", type: "regex", value: "\\bcount\\b|\\boccurrences?\\b|\\bnumber of\\b|\\bfreq\\b", weight: 4, reason: "Counting occurrences/number of items → map-based counting pattern." },
      { id: "hm_anagram", type: "keyword", value: "anagram", weight: 5, reason: "Anagram problems rely on comparing frequency maps." },
      { id: "hm_distinct", type: "keyword", value: "distinct", weight: 4, reason: "Distinct elements usually require set/map tracking." },
      { id: "hm_duplicate", type: "regex", value: "\\bduplicate\\b|\\brepeat\\b|\\bfirst unique\\b|\\bunique\\b", weight: 3, reason: "Duplicate/unique detection often uses a hash map or set." },
    ],
  },

  {
    id: "stack_monotonic",
    name: "Stack / Monotonic Stack",
    maxScoreHint: 18,
    rules: [
      { id: "st_next_greater", type: "regex", value: "next greater|next smaller|previous greater|previous smaller", weight: 7, reason: "Next/previous greater/smaller → monotonic stack is the standard solution." },
      { id: "st_parentheses", type: "regex", value: "valid parentheses|balanced parentheses|brackets|parentheses", weight: 6, reason: "Parentheses/brackets validity → stack tracks opening symbols." },
      { id: "st_histogram", type: "regex", value: "histogram|largest rectangle|rectangle in histogram", weight: 7, reason: "Histogram/largest rectangle → classic monotonic stack pattern." },
      { id: "st_word_stack", type: "keyword", value: "stack", weight: 3, reason: "Explicitly mentions stack → likely stack-based approach." },
    ],
  },

  {
    id: "binary_search",
    name: "Binary Search",
    maxScoreHint: 16,
    rules: [
      { id: "bs_sorted", type: "keyword", value: "sorted", weight: 6, reason: "Sorted input → binary search is a direct candidate." },
      { id: "bs_log", type: "regex", value: "O\\(log\\s*n\\)|log\\s*n|binary search", weight: 5, reason: "Mentions log time/binary search → strongly suggests binary search." },
      { id: "bs_boundary", type: "regex", value: "\\bfirst\\b|\\blast\\b|\\blower bound\\b|\\bupper bound\\b", weight: 4, reason: "Boundary language (first/last) → typical binary search boundary finding." },
      { id: "bs_answer", type: "regex", value: "minimize the maximum|maximize the minimum|minimum possible|maximum possible", weight: 6, reason: "Minimize max / maximize min → often binary search on answer." },
    ],
  },

  {
    id: "dynamic_programming",
    name: "Dynamic Programming",
    maxScoreHint: 20,
    rules: [
      { id: "dp_ways", type: "regex", value: "number of ways|how many ways|count the ways", weight: 7, reason: "Counting number of ways → DP over states is common." },
      { id: "dp_subsequence", type: "keyword", value: "subsequence", weight: 6, reason: "Subsequence problems often use DP (LIS/LCS style)." },
      { id: "dp_partition", type: "regex", value: "partition|split into", weight: 5, reason: "Partition/splitting → DP with prefix decisions is common." },
      { id: "dp_optimal", type: "regex", value: "optimal|maximize|minimize|minimum cost|maximum profit", weight: 5, reason: "Optimal min/max + overlapping subproblems → DP is a strong candidate." },
      { id: "dp_word", type: "keyword", value: "dp", weight: 3, reason: "Mentions DP explicitly → likely intended dynamic programming." },
    ],
  },
  
  {
  id: "linked_list_simulation",
  name: "Linked List / Simulation",
  maxScoreHint: 18,
  rules: [
    {
      id: "ll_keyword",
      type: "regex",
      value: "linked list|node|next pointer",
      weight: 7,
      reason: "Mentions linked list or node → traversal of node structure required.",
    },
    {
      id: "ll_reverse",
      type: "regex",
      value: "reverse order|reverse the list",
      weight: 4,
      reason: "Reverse order in linked list → typical pointer manipulation.",
    },
    {
      id: "ll_carry",
      type: "regex",
      value: "carry|digit|sum of two numbers",
      weight: 5,
      reason: "Digit-by-digit addition with carry → simulation over linked structure.",
    },
    {
      id: "ll_merge",
      type: "regex",
      value: "merge two lists|merge k lists",
      weight: 5,
      reason: "Merging linked lists → pointer simulation pattern.",
    },
  ],
},

];