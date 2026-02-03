"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShareClient } from "./[id]/share-client";
import { Card, CardContent } from "@/components/ui/card";

function ShareQuery() {
  const params = useSearchParams();
  const id = params.get("id") ?? "demo";
  return <ShareClient shareId={id} />;
}

export default function ShareLanding() {
  return (
    <Suspense
      fallback={
        <Card className="border-border/70 bg-white/90">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading share?</CardContent>
        </Card>
      }
    >
      <ShareQuery />
    </Suspense>
  );
}
