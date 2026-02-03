import * as React from "react";

import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive";
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border px-4 py-3 text-sm",
      variant === "destructive"
        ? "border-destructive/40 bg-destructive/5 text-destructive"
        : "border-border bg-white/90 text-foreground",
      className
    )}
    {...props}
  />
  )
);
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
