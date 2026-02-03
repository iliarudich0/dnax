import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-shimmer rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100", className)} />;
}

export { Skeleton };
