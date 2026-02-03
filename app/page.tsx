"use client";

import Link from "next/link";
import type { Route } from "next";
import type { UrlObject } from "url";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Upload, Share2, Gauge, Quote, Play } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale } from "@/components/providers/locale-provider";
import { useAuth, useReferralCode } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const heroImages = [
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
];

const DEMO_SHARE_ROUTE = "/share/mock-id" as Route;

type DemoCard = {
  title: string;
  status: string;
  badge: string;
  glow: string;
};

const demoCards: DemoCard[] = [
  {
    title: "ai-scan.mov",
    status: "72% uplink",
    badge: "live",
    glow: "from-emerald-400/50",
  },
  {
    title: "blueprint.pdf",
    status: "share link ready",
    badge: "secure",
    glow: "from-cyan-400/40",
  },
  {
    title: "orbit.png",
    status: "public preview",
    badge: "demo",
    glow: "from-indigo-400/40",
  },
];

export default function Home() {
  const { copy, locale } = useLocale();
  const { user } = useAuth();
  const referral = useReferralCode();
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const shareHref: Route | UrlObject = referral
    ? {
        pathname: DEMO_SHARE_ROUTE,
        search: `?ref=${encodeURIComponent(referral)}`,
      }
    : DEMO_SHARE_ROUTE;

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % copy.testimonials.items.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [copy.testimonials.items.length]);

  const primaryLink = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 soft-gradient opacity-80" aria-hidden />
        <section className="container relative flex flex-col gap-12 pb-20 pt-16" id="product">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-soft">
                <Sparkles className="h-4 w-4" /> {copy.brand.slogan}
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {copy.hero.title}
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">{copy.hero.subtitle}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={primaryLink}>
                  <Button size="lg" className="shadow-glow">
                    {copy.hero.primaryCta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={shareHref} prefetch={false}>
                  <Button variant="secondary" size="lg">
                    {copy.hero.secondaryCta}
                  </Button>
                </Link>
                <Badge variant="secondary">Mock + Firebase ready</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  {copy.values[2].title}
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
                  <Gauge className="h-4 w-4 text-cyan-600" /> 90+ Lighthouse target
                </div>
              </div>
            </div>
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-panel relative overflow-hidden rounded-[32px] border border-white/60 bg-white/80 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-emerald-50/50 to-white/60" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-glow" />
                      <div>
                        <p className="text-sm text-muted-foreground">{copy.brand.slogan}</p>
                        <p className="text-lg font-semibold">{copy.brand.name}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Beta-ready</Badge>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {demoCards.map((card) => (
                      <motion.div
                        key={card.title}
                        whileHover={{ y: -6 }}
                        className="relative overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/80 p-4 shadow-soft"
                      >
                        <div className={cn("absolute inset-0 bg-gradient-to-br to-white", card.glow)} />
                        <div className="relative flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>{card.badge}</span>
                            <span className="text-emerald-600">{card.status}</span>
                          </div>
                          <p className="text-sm font-semibold">{card.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-1 w-10 rounded-full bg-emerald-200" />
                            /share
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-border/80 bg-white/80 p-4 shadow-soft">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Upload className="h-4 w-4 text-emerald-600" /> {copy.demo.uploadSpeed}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{copy.demo.desc}</p>
                    </div>
                    <div className="rounded-3xl border border-border/80 bg-white/80 p-4 shadow-soft">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Share2 className="h-4 w-4 text-cyan-600" /> {copy.demo.livePreview}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{copy.demo.mockMode}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="absolute -left-6 bottom-6 hidden h-24 w-24 rounded-full bg-emerald-200/60 blur-3xl sm:block" />
              <div className="absolute -right-6 -top-6 hidden h-28 w-28 rounded-full bg-cyan-200/70 blur-3xl sm:block" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border/60 bg-white/70 p-4 shadow-sm">
            <div className="flex items-center gap-4 text-sm">
              <Badge>{copy.social.users}</Badge>
              <Badge variant="secondary">{copy.social.countries}</Badge>
              <Badge variant="secondary">{copy.social.rating}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">{copy.social.note}</div>
          </div>
        </section>

        <section className="container grid gap-6 pb-16" id="product">
          <div className="grid gap-4 sm:grid-cols-3">
            {copy.values.map((value) => (
              <Card key={value.title} className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-transparent" />
                <CardHeader>
                  <CardTitle>{value.title}</CardTitle>
                  <CardDescription>{value.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="rounded-3xl border border-border/80 bg-white/80 p-6 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <Play className="h-4 w-4" /> {copy.demo.title}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{copy.demo.desc}</p>
              <Tabs defaultValue="upload" className="mt-4">
                <TabsList>
                  <TabsTrigger value="upload">{copy.dashboard.uploads.title}</TabsTrigger>
                  <TabsTrigger value="share">/share</TabsTrigger>
                  <TabsTrigger value="mock">Mock</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>cosmos.ai.mov</span>
                      <span>72% uplink</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                        initial={{ width: "20%" }}
                        animate={{ width: "80%" }}
                        transition={{ duration: 1.2 }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">{copy.demo.uploadSpeed}</div>
                  </div>
                </TabsContent>
                <TabsContent value="share">
                  <Card className="bg-gradient-to-br from-white to-emerald-50">
                    <CardHeader>
                      <CardTitle>/share/nebula</CardTitle>
                      <CardDescription>{copy.share.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm">
                      <span>https://lumina.app/share/nebula</span>
                      <Button size="sm" variant="outline">
                        {copy.share.copy}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="mock">
                  <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" /> {copy.demo.mockMode}
                    </div>
                    <div className="rounded-2xl bg-muted/60 p-3">
                      <p>localStorage ➜ uploads.json</p>
                      <p>referral ➜ {referral ?? "brak"}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="rounded-3xl border border-border/80 bg-white/80 p-6 shadow-soft">
              <p className="text-sm font-semibold text-emerald-700">{copy.steps.title}</p>
              <div className="mt-4 grid gap-3">
                {copy.steps.items.map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-2xl border border-border/70 bg-white/70 p-4 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-white shadow-glow">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container space-y-8 pb-16" id="pricing">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-emerald-700">{copy.pricing.subtitle}</p>
            <h2 className="text-3xl font-semibold">{copy.pricing.title}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {copy.pricing.plans.map((plan) => (
              <Card key={plan.name} className="flex flex-col justify-between">
                <div className="space-y-3">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.price}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        {feature}
                      </div>
                    ))}
                  </CardContent>
                </div>
                <div className="p-6 pt-0">
                  <Link href={primaryLink}>
                    <Button className="w-full" variant={plan.name === "Pro" ? "default" : "secondary"}>
                      {copy.hero.primaryCta}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="container grid gap-6 pb-16">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">{copy.testimonials.title}</p>
              <h3 className="text-2xl font-semibold">{copy.brand.name}</h3>
            </div>
            <Badge variant="secondary">{locale.toUpperCase()}</Badge>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="relative">
              <Image
                src={heroImages[0]}
                alt="Hero"
                width={900}
                height={600}
                className="h-full w-full rounded-3xl object-cover shadow-soft"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-2 text-sm font-semibold text-foreground shadow-soft">
                <Quote className="h-4 w-4 text-emerald-600" /> {copy.brand.slogan}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-white/80 p-6 shadow-soft">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={testimonialIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-lg font-semibold leading-tight">
                    “{copy.testimonials.items[testimonialIndex].quote}”
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {copy.testimonials.items[testimonialIndex].name}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-6 flex gap-2">
                {copy.testimonials.items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestimonialIndex(idx)}
                    className={cn(
                      "h-2 w-10 rounded-full bg-muted",
                      idx === testimonialIndex && "bg-emerald-500"
                    )}
                    aria-label={`testimonial-${idx}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-white/80 p-8 shadow-glow">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-cyan-50" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">{copy.ctaBar.title}</h3>
                <p className="text-sm text-muted-foreground">{copy.ctaBar.subtitle}</p>
              </div>
              <Link href={primaryLink}>
                <Button size="lg">{copy.ctaBar.button}</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <div className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-soft sm:hidden">
        <span className="text-sm font-semibold">{copy.hero.primaryCta}</span>
        <Link href={primaryLink}>
          <Button size="sm">{copy.hero.primaryCta}</Button>
        </Link>
      </div>
      <Footer />
    </div>
  );
}
