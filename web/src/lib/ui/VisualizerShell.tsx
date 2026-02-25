"use client";
import BackButton from "@/lib/ui/BackButton";

import React from "react";
import { UI } from "@/lib/ui/styles";

type ShellProps = {
  title: string;
  subtitle?: React.ReactNode;

  // Top controls panel (inputs + playback + timeline + chips + banner + note)
  controls?: React.ReactNode;

  // Main visualization area (your animated window + cells)
  children: React.ReactNode;

  // Optional right-side panel (freq map, extras, etc.)
  side?: React.ReactNode;

  // Optional bottom area (best window card, tips, etc.)
  footer?: React.ReactNode;
};

export default function VisualizerShell({
  title,
  subtitle,
  controls,
  children,
  side,
  footer,
}: ShellProps) {
  return (
    <main className={UI.page}>
      <div className={UI.container}>
        <header className="space-y-2">
  <div className="flex items-center justify-between">
    <BackButton />
    <div className="hidden md:block" />
  </div>
  <h1 className={UI.title}>{title}</h1>
  {subtitle ? <div className={UI.subtitle}>{subtitle}</div> : null}
</header>

        {/* Controls */}
        {controls ? (
          <section className={`${UI.panel} ${UI.panelInner}`}>{controls}</section>
        ) : null}

        {/* Main grid */}
        {side ? (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${UI.panel} ${UI.panelInner}`}>
              {children}
              {footer ? <div className="pt-2">{footer}</div> : null}
            </div>

            <div className={`${UI.panel} ${UI.panelInner}`}>{side}</div>
          </section>
        ) : (
          <section className={`${UI.panel} ${UI.panelInner}`}>
            {children}
            {footer ? <div className="pt-2">{footer}</div> : null}
          </section>
        )}
      </div>
    </main>
  );
}