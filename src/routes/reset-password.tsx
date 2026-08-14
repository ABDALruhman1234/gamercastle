import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonNav } from "@/components/NeonNav";
import { friendlyError } from "@/lib/laptop-schema";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password | لابتوبات سوريا" },
      { name: "description", content: "Set a new password for your Syria Laptops store account." },
      { property: "og:title", content: "Reset Password | لابتوبات سوريا" },
      {
        property: "og:description",
        content: "Set a new password for your Syria Laptops store account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You are signed in.");
      router.navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(friendlyError(err, "Could not update the password. Open the email link again."));
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
            NEW PASSWORD
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a new password for your store account.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button variant="neon" className="w-full" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Update password"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
