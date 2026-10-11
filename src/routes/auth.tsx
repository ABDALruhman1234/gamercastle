import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonNav } from "@/components/NeonNav";
import { ADMIN_EMAIL } from "@/lib/products";
import { friendlyError } from "@/lib/laptop-schema";


export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Login | OSINT store" },
      {
        name: "description",
        content: "Secure staff login for the OSINT store product catalog manager.",
      },
      { property: "og:title", content: "Admin Login | OSINT store" },
      {
        property: "og:description",
        content: "Secure staff login for the OSINT store product catalog manager.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!data.user) return;
        const current = data.user.email?.trim().toLowerCase();
        router.navigate({ to: current === ADMIN_EMAIL ? "/admin" : "/", replace: true });
      })
      .catch(() => {
        // No active session (or the backend is unreachable) — stay on the login form.
      });
  }, [router]);


  async function sendReset() {
    if (!email) {
      toast.error("Enter your email first, then tap reset.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent. Check your inbox.");
    } catch (err) {
      toast.error(friendlyError(err, "Could not send the reset email."));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
        return;
      }

      let { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // Email not verified yet — resend the confirmation and explain clearly.
      if (error && /email not confirmed|not confirmed/i.test(error.message)) {
        await supabase.auth
          .resend({ type: "signup", email, options: { emailRedirectTo: window.location.origin } })
          .catch(() => undefined);
        toast.error("Email not verified yet — we just sent a new confirmation link.");
        return;
      }

      if (error && /invalid login credentials/i.test(error.message)) {
        // Either the account does not exist yet, or the password is wrong.
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) {
          if (/already registered|already exists|user_already/i.test(signUpError.message)) {
            toast.error("Incorrect password for this account. Use “Forgot password?” to reset it.");
            return;
          }
          if (/pwned|breach|weak/i.test(signUpError.message)) {
            toast.error("That password appears in a known data breach. Choose a stronger one.");
            return;
          }
          throw signUpError;
        }
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
        if (error && /not confirmed/i.test(error.message)) {
          toast.success("Account created. Confirm your email, then sign in.");
          return;
        }
      }
      if (error) throw error;
      const signedInEmail = data.user?.email?.trim().toLowerCase();

      if (signedInEmail !== ADMIN_EMAIL) {
        toast.info("Signed in, but this account has no catalog access.");
        router.navigate({ to: "/", replace: true });
        return;
      }
      toast.success("Access granted, operator.");
      router.navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(friendlyError(err, "Authentication failed. Please try again."));
    } finally {

      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen grid-bg">
      <NeonNav />
      <main className="mx-auto flex min-h-[calc(100dvh-61px)] w-full max-w-md flex-col justify-center px-3 py-8 sm:px-4 sm:py-16">
        <div className="neon-panel animate-rise rounded-lg p-5 sm:p-8">
          <h1 className="font-display text-xl font-black tracking-widest text-rgb sm:text-2xl">
            SECURE ACCESS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Authorized personnel only. Catalog controls unlock for the store administrator.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@store.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button variant="neon" className="w-full" type="submit" disabled={loading}>
              {loading ? "Connecting…" : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <Button
            type="button"
            variant="link"
            className="mt-3 h-auto w-full whitespace-normal py-1 text-center text-sm text-secondary"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already registered? Sign in"}
          </Button>

          <Button
            type="button"
            variant="link"
            disabled={loading}
            className="mt-1 h-auto w-full py-1 text-center text-sm text-muted-foreground"
            onClick={sendReset}
          >
            Forgot password?
          </Button>

        </div>
      </main>
    </div>
  );
}
