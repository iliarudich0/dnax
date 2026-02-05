"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, useAuthModeLabel } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
  { href: "#traits", label: "Traits" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const mode = useAuthModeLabel();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background">TL</span>
          <div className="flex flex-col leading-tight">
            <span>TikDNA</span>
            <span className="text-xs text-muted-foreground">Educational genetics</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link key={item.href} className="hover:text-foreground/80" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="hidden md:inline-flex">
            {mode} mode
          </Badge>
          <Link href={user ? "/dashboard" : "/auth"}>
            <Button variant="secondary" className="hidden sm:inline-flex">
              {user ? "Dashboard" : "Sign in"}
            </Button>
          </Link>
          <Link href={user ? "/dashboard/uploads" : "/auth"}>
            <Button className={cn("shadow-sm", pathname.startsWith("/dashboard") && "bg-foreground text-background")}>Upload DNA</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
