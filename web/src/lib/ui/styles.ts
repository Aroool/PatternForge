// web/src/lib/ui/styles.ts
// Centralized Tailwind class tokens for PatternForge UI.
// Use these everywhere so the whole app has one consistent theme.

export const UI = {
  // Layout
  page: "min-h-screen",
  container: "mx-auto max-w-6xl p-6 md:p-10 space-y-6",

  // Typography
  title: "text-3xl md:text-4xl font-bold",
  subtitle: "text-sm md:text-base text-neutral-300",
  sectionTitle: "text-sm font-medium text-white",
  hint: "text-xs text-neutral-400",
  note: "text-sm text-neutral-200",

  // Surfaces
  panel:
    "rounded-2xl border border-neutral-800 bg-neutral-950/40 text-white",
  panelInner: "p-5 md:p-6 space-y-4",
  card:
    "rounded-xl border border-neutral-800 bg-neutral-900/40 text-white",
  cardInner: "p-4 space-y-2",

  // Chips / badges
  chip:
    "rounded-full border border-neutral-700 bg-neutral-900/70 text-white px-3 py-1 text-sm",

  // Inputs
  input:
    "w-full rounded-xl border border-neutral-800 bg-neutral-950/40 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-600",
  textarea:
    "w-full rounded-xl border border-neutral-800 bg-neutral-950/40 text-white p-4 outline-none focus:ring-2 focus:ring-neutral-600",

  // Buttons
  btnPrimary:
    "rounded-xl px-4 py-2 bg-white text-black disabled:opacity-40",
  btnGhost:
    "rounded-xl px-4 py-2 border border-neutral-700 bg-neutral-900/50 text-white disabled:opacity-40",

  // Range / slider
  range: "w-full",

  // Visualizer cells
  cellBase:
    "flex items-center justify-center border border-neutral-700 rounded-xl mx-1 text-sm font-semibold",
  cellActive: "bg-white/10 text-white",
  cellInactive: "bg-transparent text-white",
  cellAdded: "ring-2 ring-white/60",
  cellRemoved: "opacity-60",

  // Window highlight overlay (Framer Motion div)
  windowHighlight:
    "absolute top-8 h-12 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm shadow-[0_0_18px_rgba(255,255,255,0.12)]",

  // Banner (valid/invalid)
  banner:
    "rounded-xl border border-neutral-700 bg-neutral-900/70 text-white px-4 py-3 text-sm",
  bannerSub: "text-neutral-200",
} as const;