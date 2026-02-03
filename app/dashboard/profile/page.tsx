"use client";

import { useAuth, useReferralCode } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { withBasePath } from "@/lib/urls";

export default function ProfilePage() {
  const { user } = useAuth();
  const { copy } = useLocale();
  const referral = useReferralCode();

  const handleCopy = () => {
    if (!user) return;
    const link = `${window.location.origin}${withBasePath(`/share/mock-id?ref=${referral ?? "lumina"}`)}`;
    navigator.clipboard.writeText(link);
    toast.success(copy.toasts.copied);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-700">{copy.dashboard.profile.title}</p>
        <p className="text-sm text-muted-foreground">{copy.dashboard.profile.subtitle}</p>
      </div>
      <Card className="border border-border/60 bg-white/80">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} alt={user?.displayName} />
            <AvatarFallback>{user?.displayName?.[0] ?? "L"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user?.displayName}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-border/70 bg-muted/60 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>{copy.dashboard.settings.referral}</span>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" /> {copy.share.copy}
              </Button>
            </div>
            <p className="mt-2 text-muted-foreground">{referral ?? "lumina"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
