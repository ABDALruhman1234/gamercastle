import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonNav } from "@/components/NeonNav";
import { ADMIN_EMAIL } from "@/lib/laptops";
import { friendlyError } from "@/lib/laptop-schema";


export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Login | Professional Store" },
      {
        name: "description",
        content: "Secure staff login for the Professional Store gaming laptop catalog manager.",
      },
      { property: "og:title", content: "Admin Login | Professional Store" },
      {
        property: "og:description",
        content: "Secure staff login for the Professional Store gaming laptop catalog manager.",
      },
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
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
        return;
      }
      let { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error && /invalid login credentials/i.test(error.message)) {
        // Account doesn't exist yet — create it, then sign in.
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw signUpError;
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
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
      <main className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <div className="neon-panel animate-rise rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-black tracking-widest text-rgb">
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

          <button
            type="button"
            className="mt-4 w-full cursor-pointer text-center text-sm text-secondary underline-offset-4 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already registered? Sign in"}
          </button>
        </div>
      </main>
    </div>
  );
}
