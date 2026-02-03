"use client";

import Link from "next/link";
import { ArrowRight, UploadCloud, Shield, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";

export default function DashboardPage() {
  const { copy } = useLocale();

  const cards = [
    { title: copy.dashboard.uploads.title, desc: copy.dashboard.uploads.subtitle, href: "/dashboard/uploads", icon: UploadCloud },
    { title: copy.dashboard.library.title, desc: copy.dashboard.library.empty, href: "/dashboard/library", icon: Share2 },
    { title: copy.steps.items[2].title, desc: copy.steps.items[2].desc, href: "/share/mock-id", icon: Shield },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-700">{copy.dashboard.welcome}</p>
        <h1 className="text-2xl font-semibold">LuminaNet</h1>
        <p className="text-sm text-muted-foreground">{copy.values[1].desc}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border border-border/70 bg-white/80">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.desc}</CardDescription>
                </div>
                <Icon className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <Link href={card.href}>
                  <Button variant="secondary" className="w-full">
                    {copy.hero.secondaryCta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
