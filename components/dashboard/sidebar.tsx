"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, Library, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", icon: Home },
  { href: "/dashboard/uploads", icon: Upload },
  { href: "/dashboard/library", icon: Library },
  { href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { copy } = useLocale();
  const { user, signOut } = useAuth();

  return (
    <aside className="glass-panel flex h-full flex-col gap-6 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-soft dark:bg-white/5">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.avatar} alt={user?.displayName} />
          <AvatarFallback>{user?.displayName?.[0] ?? "L"}</AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <p className="text-sm text-muted-foreground">{copy.dashboard.welcome}</p>
          <p className="text-base font-semibold">{user?.displayName || user?.email}</p>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {items.map((item, index) => {
          const label = Object.values(copy.dashboard.sidebar)[index];
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold transition",
                active
                  ? "bg-gradient-to-r from-emerald-500/80 to-cyan-500/70 text-white shadow-glow"
                  : "bg-white/60 text-foreground hover:bg-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <Button variant="ghost" className="mt-auto" onClick={() => signOut()}>
        Wyloguj
      </Button>
    </aside>
  );
}
