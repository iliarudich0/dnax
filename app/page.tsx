"use client";

import Link from "next/link";
import { ArrowRight, Shield, UploadCloud, Sparkles, Lock, FlaskConical, LineChart } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

const steps = [
  {
    title: "Upload your raw DNA file",
    description: "23andMe, AncestryDNA, MyHeritage and similar formats supported.",
    icon: UploadCloud,
  },
  {
    title: "Normalize SNPs securely",
    description: "We convert rsid + genotype into a clean, portable dataset.",
    icon: LineChart,
  },
  {
    title: "Explore trait reports",
    description: "Get non-medical, educational insights with limitations clearly stated.",
    icon: FlaskConical,
  },
];

const highlights = [
  {
    title: "Privacy-first by design",
    description: "Raw files are never public, and you can delete everything anytime.",
    icon: Lock,
  },
  {
    title: "Educational only",
    description: "TraitLens is not a medical device and does not provide diagnosis.",
    icon: Shield,
  },
  {
    title: "Runs without Firebase",
    description: "Mock mode stores data locally for fast demos and testing.",
    icon: Sparkles,
  },
];

const sampleTraits = [
  "Lactose tolerance",
  "Caffeine metabolism",
  "Bitter taste sensitivity",
  "Alcohol flush proxy",
  "Muscle performance",
  "Eye color proxy",
  "Hair thickness",
  "Omega-3 conversion",
];

export default function Home() {
  const { user } = useAuth();
  const primaryLink = user ? "/dashboard/uploads" : "/auth";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="relative overflow-hidden">
        <section className="container grid gap-12 pb-20 pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="w-fit" variant="secondary">
                Educational genetics platform
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Upload raw DNA. Get trait reports you can actually understand.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                TraitLens turns consumer DNA files into clear, non-medical trait summaries. Built for privacy, with
                easy deletion and transparent limitations.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={primaryLink}>
                  <Button size="lg" className="gap-2">
                    Upload DNA file
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/share/demo">
                  <Button variant="secondary" size="lg">
                    See demo report
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1">Raw data deleted after retention window</span>
                <span className="rounded-full border border-border px-3 py-1">No medical advice</span>
              </div>
            </div>
            <div className="glass-panel halo grid gap-4 rounded-[32px] p-6">
              <div className="grid grid-cols-2 gap-3">
                {highlights.map((item) => (
                  <Card key={item.title} className="border-border/60 bg-white/80">
                    <CardHeader>
                      <item.icon className="h-5 w-5" />
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <div className="rounded-3xl border border-border/70 bg-white/90 p-4">
                <p className="text-sm font-semibold">Traits included in MVP</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {sampleTraits.map((trait) => (
                    <span key={trait} className="rounded-full border border-border px-3 py-1">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container grid gap-6 pb-20" id="how-it-works">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">How it works</h2>
            <Badge variant="outline">3 minutes or less</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.title} className="border-border/70 bg-white/80">
                <CardHeader>
                  <step.icon className="h-5 w-5" />
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="container grid gap-6 pb-20" id="traits">
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-muted-foreground">Traits snapshot</p>
            <h3 className="text-2xl font-semibold">Clear summaries, not raw SNP dumps</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/70 bg-white/80">
              <CardHeader>
                <CardTitle>Educational insights</CardTitle>
                <CardDescription>
                  Each trait includes your genotype, interpretation, and limitations with links to sources.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/70 bg-white/80">
              <CardHeader>
                <CardTitle>Privacy-first sharing</CardTitle>
                <CardDescription>
                  Share a short summary without exposing raw DNA or exact genotypes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="container pb-20" id="privacy">
          <Card className="border-border/70 bg-white/90">
            <CardContent className="grid gap-4 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Shield className="h-4 w-4" /> Privacy & disclaimer
              </div>
              <p className="text-sm text-muted-foreground">
                TraitLens is for educational purposes only and is not a medical device. Trait reports are based on
                public SNP associations and do not predict disease risk. Always consult a clinician for medical
                guidance.
              </p>
              <p className="text-sm text-muted-foreground">
                You control your data. Raw DNA files are private and deleted after your retention window (default 7
                days). You can delete all data with one click.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
