import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAIL } from "@/lib/laptops";
import { Button } from "@/components/ui/button";

export function NeonNav() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = email?.toLowerCase() === ADMIN_EMAIL;

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-[0_1px_24px_-6px_var(--primary)]">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-display text-lg font-black tracking-[0.2em] sm:text-xl">
          <span className="text-rgb">PROFESSIONAL</span>{" "}
          <span className="text-foreground">STORE</span>
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="cyber" size="sm" asChild>
              <Link to="/admin">Dashboard</Link>
            </Button>
          )}
          {email ? (
            <Button variant="neon" size="sm" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <Button variant="neon" size="sm" asChild>
              <Link to="/auth">Admin Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
