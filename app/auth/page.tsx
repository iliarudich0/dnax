"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth, useAuthModeLabel } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading } = useAuth();
  const mode = useAuthModeLabel();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authenticate");
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authenticate");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
        <Card className="w-full max-w-md border-border/70 bg-white/90">
          <CardHeader>
            <CardTitle>{isSignUp ? "Create your account" : "Welcome back"}</CardTitle>
            <CardDescription>
              {mode} mode ? Use email/password or Google (Firebase only).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {isSignUp ? "Create account" : "Sign in"}
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleGoogle} disabled={loading}>
              Continue with Google
            </Button>
          </CardContent>
          <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{isSignUp ? "Already have an account?" : "New to TikDNA?"}</span>
            <button
              type="button"
              className="font-semibold text-foreground"
              onClick={() => setIsSignUp((prev) => !prev)}
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
