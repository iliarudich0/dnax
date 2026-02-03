"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { listUploads, getTraitResults } from "@/lib/data";
import { traitCatalog } from "@/lib/traits/catalog";
import { TraitResult, TraitCategory } from "@/lib/types";

const categories: Array<TraitCategory | "All"> = ["All", "Lifestyle", "Nutrition", "Physical", "Appearance"];

export default function TraitsPage() {
  const { user } = useAuth();
  const [traits, setTraits] = useState<TraitResult[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TraitCategory | "All">("All");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const uploads = await listUploads(user.id);
      if (!uploads[0]) {
        setTraits([]);
        return;
      }
      const results = await getTraitResults(user.id, uploads[0].id);
      setTraits(results);
    };
    load();
  }, [user]);

  const filtered = useMemo(() => {
    return traits.filter((trait) => {
      const matchesSearch = trait.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || trait.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [traits, search, category]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Trait reports</h1>
          <p className="text-sm text-muted-foreground">Based on the latest upload in your account.</p>
        </div>
        <Badge variant="secondary">{traits.length || traitCatalog.length} traits</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Search traits" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              className={`rounded-full border border-border px-3 py-1 text-sm ${category === item ? "bg-foreground text-background" : "bg-white/70"}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <Card className="border-border/70 bg-white/90">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Upload a DNA file to generate personalized trait results.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((trait) => (
            <Link key={trait.traitId} href={`/dashboard/traits/${trait.traitId}`}>
              <Card className="border-border/70 bg-white/90 transition hover:shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{trait.name}</CardTitle>
                  <CardDescription>{trait.outcome}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{trait.category}</span>
                  <span>Confidence: {trait.confidence}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
