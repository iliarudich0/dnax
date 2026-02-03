"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { storeReferral } from "@/lib/mock-store";

export function ReferrerTracker() {
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) {
      storeReferral(ref);
    }
  }, [params]);

  return null;
}
