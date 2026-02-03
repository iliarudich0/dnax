"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const REFERRAL_KEY = "genomelink_referral";

export function ReferrerTracker() {
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("ref");
    if (ref && typeof window !== "undefined") {
      window.localStorage.setItem(REFERRAL_KEY, ref);
    }
  }, [params]);

  return null;
}

export function getStoredReferral() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFERRAL_KEY);
}
