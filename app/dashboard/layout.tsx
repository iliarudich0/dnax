"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/uploads", label: "Uploads" },
  { href: "/dashboard/ethnicity", label: "Ethnicity" },
  { href: "/dashboard/traits", label: "Traits" },
  { href: "/dashboard/gedcom", label: "GEDCOM" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container grid gap-8 pb-16 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border border-border px-4 py-2 text-sm font-medium",
                  pathname === item.href ? "bg-foreground text-background" : "bg-white/70"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{user?.email ?? user?.name}</span>
            <Button variant="secondary" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
