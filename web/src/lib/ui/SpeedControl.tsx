"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
  onChange: (val: number) => void;
};

const PRESETS = [
  { label: "Slow", value: 1000 },
  { label: "Normal", value: 650 },
  { label: "Fast", value: 350 },
  { label: "Turbo", value: 150 },
];

export default function SpeedControl({ value, onChange }: Props) {
  const [mode, setMode] = useState<string>("Normal");
  const [inputValue, setInputValue] = useState<number>(value);

  // Sync preset mode if value matches preset
  useEffect(() => {
    const preset = PRESETS.find((p) => p.value === value);
    if (preset) {
      setMode(preset.label);
    } else {
      setMode("Custom");
    }
    setInputValue(value);
  }, [value]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-400">Speed</span>

      {/* Dropdown */}
      <select
        value={mode}
        onChange={(e) => {
          const selected = e.target.value;
          setMode(selected);

          if (selected !== "Custom") {
            const preset = PRESETS.find((p) => p.label === selected);
            if (preset) onChange(preset.value);
          }
        }}
        className="rounded-lg border border-neutral-700 bg-neutral-900 text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/30"
      >
        {PRESETS.map((p) => (
          <option key={p.label} value={p.label}>
            {p.label}
          </option>
        ))}
        <option value="Custom">Custom</option>
      </select>

      {/* Manual Input */}
      <input
        type="number"
        min={50}
        max={5000}
        value={inputValue}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (!Number.isFinite(val)) return;
          setMode("Custom");
          setInputValue(val);
          onChange(val);
        }}
        className="w-20 rounded-lg border border-neutral-700 bg-neutral-900 text-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/30"
      />

      <span className="text-xs text-neutral-500">ms</span>
    </div>
  );
}