"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { mockMode } from "@/lib/env";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AuthPage() {
  const { signIn, register: registerUser, signInWithGoogle, user } = useAuth();
  const { copy } = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [router, user]);

  const onSubmit = async (values: FormValues) => {
    if (mode === "register" && !values.name) {
      form.setError("name", { message: "Podaj imię" });
      return;
    }

    try {
      setLoading(true);
      if (mode === "login") {
        await signIn(values.email, values.password);
      } else {
        await registerUser(values.email, values.password, values.name ?? "");
      }
      toast.success(mode === "login" ? "Zalogowano" : "Utworzono konto");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container flex min-h-screen items-center justify-center py-16">
        <Card className="w-full max-w-xl border border-border/60 bg-white/80">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">{copy.auth.title}</CardTitle>
            <CardDescription>{copy.auth.subtitle}</CardDescription>
            {mockMode && (
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" /> Mock mode (localStorage)
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              {mode === "register" && (
                <div className="space-y-1">
                  <Label htmlFor="name">{copy.auth.name}</Label>
                  <Input id="name" {...form.register("name")} placeholder="Ava Nowak" />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="email">{copy.auth.email}</Label>
                <Input id="email" type="email" {...form.register("email")} placeholder="you@future.dev" />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">{copy.auth.password}</Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? copy.auth.login : copy.auth.register}
              </Button>
            </form>
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">lub</span>
              <Separator className="flex-1" />
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => signInWithGoogle().then(() => router.push("/dashboard"))}
              disabled={loading}
            >
              {copy.auth.google}
            </Button>
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="w-full text-center text-sm font-semibold text-emerald-700"
            >
              {mode === "login" ? copy.auth.switchToRegister : copy.auth.switchToLogin}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
