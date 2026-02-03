"use client";

import Link from "next/link";
import type { Route } from "next";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/components/providers/locale-provider";

export function Footer() {
  const { copy } = useLocale();
  return (
    <footer className="border-t border-border/80 bg-white/80 py-12 text-sm text-muted-foreground dark:bg-black/50" id="docs">
      <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-foreground">LuminaNet</div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {copy.social.note}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="#" className="hover:text-foreground">
            {copy.footer.privacy}
          </Link>
          <Separator orientation="vertical" className="hidden h-5 md:block" />
          <Link href="#" className="hover:text-foreground">
            {copy.footer.terms}
          </Link>
          <Separator orientation="vertical" className="hidden h-5 md:block" />
          <Link href={"/CREDITS.md" as Route} className="hover:text-foreground" prefetch={false}>
            {copy.footer.credits}
          </Link>
          <Separator orientation="vertical" className="hidden h-5 md:block" />
          <Link href="mailto:hello@lumina.net" className="hover:text-foreground">
            {copy.footer.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
