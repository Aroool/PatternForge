"use client";
import { analyzeProblem } from "@/lib/analyzer/analyze";
import { useState } from "react";

type AnalyzeResult = {
  pattern: string;
  confidence: number;
  reasons: string[];
  debugTop3: { pattern: string; score: number; confidence: number }[];
};

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const onAnalyze = () => {
    const res = analyzeProblem(text);
    setResult(res);
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl p-6 md:p-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">PatternForge</h1>
          <p className="text-sm md:text-base text-neutral-600">
            Paste a coding question. Get the likely DSA pattern + strong reasons.
          </p>
        </header>

        <section className="space-y-3">
          <label className="text-sm font-medium">Problem</label>
          <textarea
            className="w-full min-h-[180px] rounded-xl border p-4 outline-none focus:ring-2 focus:ring-neutral-300"
            placeholder="Paste a LeetCode-style question here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={onAnalyze}
              disabled={text.trim().length === 0}
              className="rounded-xl px-5 py-2.5 bg-black text-white disabled:opacity-40"
            >
              Analyze
            </button>
            <button
              onClick={() => {
                setText("");
                setResult(null);
              }}
              className="rounded-xl px-5 py-2.5 border"
            >
              Clear
            </button>
          </div>
        </section>

        {result && (
          <section className="rounded-2xl border p-5 md:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-lg font-semibold">
                Pattern: <span className="font-bold">{result.pattern}</span>
              </div>
              <div className="text-sm rounded-full border px-3 py-1">
                Confidence: {result.confidence}%
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Why this pattern?</div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-700">
                {result.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <details className="rounded-xl border bg-neutral-50/50 p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Debug: Top candidate patterns
                </summary>

                <div className="mt-3 space-y-2">
                  {result.debugTop3?.length ? (
                    result.debugTop3.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border bg-white px-3 py-2"
                      >
                        <div className="text-sm font-medium">{p.pattern}</div>
                        <div className="text-xs text-neutral-600">
                          score: <span className="font-semibold">{p.score}</span>{" "}
                          · confidence:{" "}
                          <span className="font-semibold">{p.confidence}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-neutral-600">No candidates yet.</div>
                  )}
                </div>
              </details>
            </div>
          </section>
        )}

        <footer className="text-xs text-neutral-500 pt-6">
          Next: add more patterns + then start the visualizer animations.
        </footer>
      </div>
    </main>
  );
}