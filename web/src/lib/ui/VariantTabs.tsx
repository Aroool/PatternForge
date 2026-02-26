"use client";

type Option<T extends string> = {
  value: T;
  label: string;
};

export default function VariantTabs<T extends string>({
  label = "Variant",
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-white/90">{label}</div>

      <div className="inline-flex rounded-xl border border-neutral-800 bg-neutral-950/40 p-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "px-3 py-2 text-sm rounded-lg transition",
                "focus:outline-none focus:ring-2 focus:ring-white/15",
                active
                  ? "bg-white text-black shadow"
                  : "text-white/80 hover:bg-white/5",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}