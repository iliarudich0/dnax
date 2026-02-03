"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/auth-provider";
import { deleteUserData, getSettings, updateSettings } from "@/lib/data";
import { clearLocalKey } from "@/lib/encryption";

export default function SettingsPage() {
  const { user } = useAuth();
  const [retentionDays, setRetentionDays] = useState(7);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const settings = await getSettings(user.id);
      if (settings?.retentionDays) setRetentionDays(settings.retentionDays);
      if (settings?.encryptionEnabled !== undefined) setEncryptionEnabled(settings.encryptionEnabled);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    await updateSettings(user.id, { retentionDays, encryptionEnabled });
    setMessage("Settings saved.");
  };

  const handleDelete = async () => {
    if (!user) return;
    await deleteUserData(user.id);
    clearLocalKey();
    setMessage("All data deleted.");
  };

  return (
    <div className="grid gap-6">
      <Card className="border-border/70 bg-white/90">
        <CardHeader>
          <CardTitle>Data controls</CardTitle>
          <CardDescription>Configure retention and encryption for raw DNA files.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Retention window (days)</label>
            <Input
              type="number"
              min={1}
              max={30}
              value={retentionDays}
              onChange={(event) => setRetentionDays(Number(event.target.value))}
            />
            <p className="text-xs text-muted-foreground">Raw DNA files are removed automatically after this period.</p>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-white/80 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Encrypt raw files before storage</p>
              <p className="text-xs text-muted-foreground">Client-side AES-GCM encryption (optional).</p>
            </div>
            <Switch checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} />
          </div>
          <Button onClick={handleSave}>Save settings</Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-white/90">
        <CardHeader>
          <CardTitle>Delete my data</CardTitle>
          <CardDescription>Removes uploads, normalized data, and shares for this account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete}>
            Delete everything
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
