"use client";

import { useTheme } from "next-themes";
import { useLocale } from "@/components/providers/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, copy } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-700">{copy.dashboard.settings.title}</p>
        <p className="text-sm text-muted-foreground">{copy.demo.desc}</p>
      </div>
      <Card className="border border-border/70 bg-white/80">
        <CardHeader>
          <CardTitle>{copy.dashboard.settings.theme}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="theme">{theme === "light" ? "Light" : "Dark"}</Label>
          <Switch
            id="theme"
            checked={theme !== "light"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </CardContent>
      </Card>
      <Card className="border border-border/70 bg-white/80">
        <CardHeader>
          <CardTitle>{copy.dashboard.settings.language}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="lang">{locale.toUpperCase()}</Label>
          <Switch
            id="lang"
            checked={locale === "en"}
            onCheckedChange={(checked) => setLocale(checked ? "en" : "pl")}
          />
        </CardContent>
      </Card>
      <Card className="border border-border/70 bg-white/80">
        <CardHeader>
          <CardTitle>{copy.dashboard.settings.delete}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => toast("Stub: konto zostanie usunięte po integracji z Firebase")}
          >
            {copy.dashboard.settings.delete}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
