"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-white/70 py-10 text-sm text-muted-foreground" id="privacy">
      <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-foreground">TraitLens</div>
          <p className="max-w-xl text-sm leading-relaxed">
            TraitLens provides educational trait insights from consumer DNA files. It does not provide medical advice.
          </p>
          <p className="text-xs">Delete data anytime. Raw files are removed automatically after your retention window.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <Separator orientation="vertical" className="hidden h-5 md:block" />
          <Link href="/CREDITS.md" className="hover:text-foreground">
            Sources
          </Link>
          <Separator orientation="vertical" className="hidden h-5 md:block" />
          <Link href="#privacy" className="hover:text-foreground">
            Privacy & disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
}
