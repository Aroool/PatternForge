"use client";

import Link from "next/link";
import { UI } from "@/lib/ui/styles";

type BackButtonProps = {
  href?: string;
  label?: string;
};

export default function BackButton({
  href = "/visualize",
  label = "Back",
}: BackButtonProps) {
  return (
    <Link href={href} className={`${UI.btnGhost} inline-flex items-center gap-2`}>
      <span className="text-lg leading-none">←</span>
      <span>{label}</span>
    </Link>
  );
}