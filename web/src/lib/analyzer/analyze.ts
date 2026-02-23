import { PATTERNS, PatternDef, Rule } from "./rules";

export type AnalysisResult = {
  pattern: string;
  confidence: number; // 0..100
  reasons: string[];  // top reasons
  debugTop3: Array<{ pattern: string; score: number; confidence: number }>;
};

type Match = {
  ruleId: string;
  weight: number;
  reason: string;
};

type PatternScore = {
  id: string;
  name: string;
  score: number;
  maxScoreHint: number;
  matches: Match[];
};

function normalize(text: string) {
  return text.toLowerCase();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchRule(text: string, rule: Rule): boolean {
  if (rule.type === "keyword") {
    // whole-word-ish match so "sorted" doesn't match "unsortedly"
    const re = new RegExp(`\\b${escapeRegex(rule.value)}\\b`, "i");
    return re.test(text);
  }

  // regex rule
  const re = new RegExp(rule.value, "i");
  return re.test(text);
}

function scorePattern(text: string, p: PatternDef): PatternScore {
  let score = 0;
  const matches: Match[] = [];

  for (const rule of p.rules) {
    if (matchRule(text, rule)) {
      score += rule.weight;
      matches.push({ ruleId: rule.id, weight: rule.weight, reason: rule.reason });
    }
  }

  // strongest reasons first
  matches.sort((a, b) => b.weight - a.weight);

  return {
    id: p.id,
    name: p.name,
    score,
    maxScoreHint: p.maxScoreHint,
    matches,
  };
}

// ✅ Named export (this is what page.tsx should import)
export function analyzeProblem(rawText: string): AnalysisResult {
  const text = normalize(rawText);

  const scored = PATTERNS.map((p) => scorePattern(text, p))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  // If score is 0, we have no signals
  if (!best || best.score === 0) {
    return {
      pattern: "Unknown (Need more signals)",
      confidence: 0,
      reasons: [
        "Not enough strong keywords/signals were detected.",
        "Try including the goal (longest/minimum/count), constraints, or key terms.",
      ],
      debugTop3: scored.slice(0, 3).map((p) => ({
        pattern: p.name,
        score: p.score,
        confidence: Math.min(100, Math.round((p.score / p.maxScoreHint) * 100)),
      })),
    };
  }

  // Confidence: score / maxScoreHint (cap at 100)
  const confidence = Math.min(100, Math.round((best.score / best.maxScoreHint) * 100));

  // reasons: top 3 matched rule reasons
  const reasons =
    best.matches.length > 0
      ? best.matches.slice(0, 3).map((m) => m.reason)
      : ["Signals found, but no rule reasons were recorded (unexpected)."];

  return {
    pattern: best.name,
    confidence,
    reasons,
    debugTop3: scored.slice(0, 3).map((p) => ({
      pattern: p.name,
      score: p.score,
      confidence: Math.min(100, Math.round((p.score / p.maxScoreHint) * 100)),
    })),
  };
}