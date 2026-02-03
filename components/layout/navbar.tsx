"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Sun, Moon, ChevronRight } from "lucide-react";
import { useMemo } from "react";

export function Navbar() {
  const { locale, setLocale, copy } = useLocale();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();

  const isDashboard = useMemo(() => pathname.startsWith("/dashboard"), [pathname]);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl dark:bg-black/40">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-glow">
            LN
          </span>
          <div className="flex flex-col leading-tight">
            <span>LuminaNet</span>
            <span className="text-xs text-muted-foreground">2100-grade</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link className="hover:text-foreground/80" href="#product">
            {copy.nav.product}
          </Link>
          <Link className="hover:text-foreground/80" href="#pricing">
            {copy.nav.pricing}
          </Link>
          <Link className="hover:text-foreground/80" href="#docs">
            {copy.nav.docs}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-2xl border border-border bg-white/80 px-2 py-1 text-xs font-semibold md:flex">
            <button
              aria-label="Polski"
              onClick={() => setLocale("pl")}
              className={`rounded-xl px-2 py-1 ${locale === "pl" ? "bg-emerald-100 text-emerald-700" : "text-muted-foreground"}`}
            >
              PL
            </button>
            <button
              aria-label="English"
              onClick={() => setLocale("en")}
              className={`rounded-xl px-2 py-1 ${locale === "en" ? "bg-emerald-100 text-emerald-700" : "text-muted-foreground"}`}
            >
              EN
            </button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="toggle theme"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="hidden sm:inline-flex"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button variant="secondary" className="hidden sm:inline-flex">
              {user ? copy.nav.dashboard : copy.nav.login}
            </Button>
          </Link>
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button size="lg" className="group">
              {copy.hero.primaryCta}
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
      {!isDashboard && (
        <div className="block border-t border-white/60 bg-white/70 px-4 py-2 text-center text-xs text-muted-foreground md:hidden">
          {copy.social.note}
        </div>
      )}
    </header>
  );
}
