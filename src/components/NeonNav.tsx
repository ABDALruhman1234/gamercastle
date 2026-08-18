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
      <nav className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 sm:flex sm:justify-between sm:px-4 sm:py-3">
        <Link
          to="/"
          className="min-w-0 truncate font-display text-xs font-black leading-tight tracking-[0.08em] min-[360px]:text-sm sm:text-lg sm:tracking-[0.15em] lg:text-xl"
          dir="rtl"
        >
          <span className="text-rgb">لابتوبات سوريا</span>{" "}
          <span className="hidden text-foreground sm:inline">(Syria Laptops)</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isAdmin && (
            <Button variant="cyber" size="sm" className="px-2.5 text-xs sm:px-3 sm:text-sm" asChild>
              <Link to="/admin">Dashboard</Link>
            </Button>
          )}
          {email ? (
            <Button
              variant="neon"
              size="sm"
              className="px-2.5 text-xs sm:px-3 sm:text-sm"
              onClick={signOut}
            >
              Sign out
            </Button>
          ) : (
            <Button variant="neon" size="sm" className="px-2 text-[10px] min-[360px]:px-2.5 min-[360px]:text-xs sm:px-3 sm:text-sm" asChild>
              <Link to="/auth">Admin Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>

  );
}
