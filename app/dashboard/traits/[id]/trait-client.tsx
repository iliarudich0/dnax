"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { getTraitResults, listUploads } from "@/lib/data";
import { traitCatalog } from "@/lib/traits/catalog";
import { TraitResult } from "@/lib/types";

export function TraitClient({ traitId }: { traitId: string }) {
  const { user } = useAuth();
  const [trait, setTrait] = useState<TraitResult | null>(null);

  useEffect(() => {
    if (!user || !traitId) return;
    const load = async () => {
      const uploads = await listUploads(user.id);
      if (!uploads[0]) {
        setTrait(null);
        return;
      }
      const results = await getTraitResults(user.id, uploads[0].id);
      const found = results.find((result) => result.traitId === traitId) ?? null;
      setTrait(found);
    };
    load();
  }, [user, traitId]);

  const definition = useMemo(() => traitCatalog.find((item) => item.id === traitId), [traitId]);

  if (!definition) {
    return (
      <Card className="border-border/70 bg-white/90">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Trait not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{definition.name}</h1>
          <p className="text-sm text-muted-foreground">{definition.description}</p>
        </div>
        <Badge variant="secondary">{definition.category}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-white/90">
          <CardHeader>
            <CardTitle>Your result</CardTitle>
            <CardDescription>Based on SNP {definition.snp.rsid}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">Genotype: {trait?.genotype ?? "--"}</Badge>
              <Badge variant="outline">Confidence: {trait?.confidence ?? "Low"}</Badge>
            </div>
            <p className="text-lg font-semibold">{trait?.outcome ?? "Not detected"}</p>
            <p className="text-sm text-muted-foreground">{trait?.summary ?? "Upload a DNA file to see your result."}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-white/90">
          <CardHeader>
            <CardTitle>What it means</CardTitle>
            <CardDescription>Educational only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{trait?.whatItMeans ?? definition.whatItMeans}</p>
            <div>
              <p className="font-semibold text-foreground">What you can do</p>
              <ul className="list-disc pl-5">
                {(trait?.whatYouCanDo ?? definition.whatYouCanDo).map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-border/70 bg-white/90">
        <CardHeader>
          <CardTitle>Limitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {(trait?.limitations ?? definition.limitations).map((item) => (
            <p key={item}>? {item}</p>
          ))}
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-white/90">
        <CardHeader>
          <CardTitle>Sources</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(trait?.sources ?? definition.sources).map((source) => (
            <Button key={source.url} variant="outline" asChild>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
