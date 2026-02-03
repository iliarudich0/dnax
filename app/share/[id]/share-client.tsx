"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getShare } from "@/lib/data";
import { ShareRecord } from "@/lib/types";

const demoShare: ShareRecord = {
  id: "demo",
  userId: "demo",
  uploadId: "demo",
  createdAt: new Date().toISOString(),
  enabled: true,
  headline: "Top trait: Caffeine Metabolism",
  note: "This is a demo summary with no raw DNA or genotype details.",
  topTraits: [
    { traitId: "caffeine-metabolism", name: "Caffeine Metabolism", category: "Lifestyle", outcome: "Fast metabolizer" },
    { traitId: "lactose-tolerance", name: "Lactose Tolerance", category: "Nutrition", outcome: "Likely lactose tolerant" },
    { traitId: "eye-color", name: "Eye Color Proxy", category: "Appearance", outcome: "Darker eyes" },
    { traitId: "bitter-taste", name: "Bitter Taste Sensitivity", category: "Nutrition", outcome: "Medium sensitivity" },
    { traitId: "muscle-performance", name: "Muscle Performance", category: "Physical", outcome: "Balanced" },
  ],
};

export function ShareClient({ shareId }: { shareId: string }) {
  const [share, setShare] = useState<ShareRecord | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!shareId) return;
    const load = async () => {
      if (shareId === "demo") {
        setShare(demoShare);
        return;
      }
      const result = await getShare(shareId);
      if (!result || !result.enabled) {
        setMissing(true);
        return;
      }
      setShare(result);
    };
    load();
  }, [shareId]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container grid gap-6 py-16">
        {missing || !share ? (
          <Card className="border-border/70 bg-white/90">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              This share link is not available. Ask the owner to enable sharing.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            <Card className="border-border/70 bg-white/90">
              <CardHeader>
                <CardTitle>{share.headline}</CardTitle>
                <CardDescription>{share.note}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Share summary</Badge>
                <Badge variant="outline">No raw DNA</Badge>
                <Badge variant="outline">No genotype details</Badge>
              </CardContent>
            </Card>
            <div className="grid gap-3 md:grid-cols-2">
              {share.topTraits.map((trait) => (
                <Card key={trait.traitId} className="border-border/70 bg-white/90">
                  <CardHeader>
                    <CardTitle className="text-base">{trait.name}</CardTitle>
                    <CardDescription>{trait.outcome}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">{trait.category}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-border/70 bg-white/90">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-6">
                <div>
                  <p className="text-sm font-medium">Want your own report?</p>
                  <p className="text-xs text-muted-foreground">Upload your raw DNA file and generate private traits.</p>
                </div>
                <Button asChild>
                  <a href="/auth">Upload DNA</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
