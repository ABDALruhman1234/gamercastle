import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonNav } from "@/components/NeonNav";
import { ADMIN_EMAIL, formatPrice, laptopsQuery, type Laptop } from "@/lib/laptops";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    const email = (context as { user?: { email?: string } }).user?.email?.trim().toLowerCase();
    if (email !== ADMIN_EMAIL) {
      throw redirect({ to: "/", search: { denied: "1" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Manage Catalog | Professional Store" },
      { name: "description", content: "Private dashboard to manage the gaming laptop inventory." },
      { property: "og:title", content: "Manage Catalog | Professional Store" },
      {
        property: "og:description",
        content: "Private dashboard to manage the gaming laptop inventory.",
      },
    ],
  }),
  component: AdminPage,
});

type FormState = Omit<Laptop, "id" | "price"> & { id?: string; price: string };

const emptyForm: FormState = {
  model: "",
  price: "",
  image_url: "",
  category: "Ultra Gaming",
  cpu: "",
  gpu: "",
  ram: "",
  storage: "",
};

function AdminPage() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [open, setOpen] = useState(false);

  const { data: laptops = [], isLoading } = useQuery(laptopsQuery);

  const save = useMutation({
    mutationFn: async (state: FormState) => {
      const payload = {
        model: state.model,
        price: Number(state.price) || 0,
        image_url: state.image_url,
        category: state.category,
        cpu: state.cpu,
        gpu: state.gpu,
        ram: state.ram,
        storage: state.storage,
      };
      const { error } = state.id
        ? await supabase.from("laptops").update(payload).eq("id", state.id)
        : await supabase.from("laptops").insert(payload);
      if (error) throw error;
    },
    onSuccess: (_d, state) => {
      toast.success(state.id ? "Laptop updated" : "Laptop added");
      setForm(emptyForm);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["laptops"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("laptops").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Laptop deleted");
      queryClient.invalidateQueries({ queryKey: ["laptops"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid-bg">
        <NeonNav />
        <main className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-black text-primary">ACCESS DENIED</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This account is not authorized to manage the catalog.
          </p>
          <Button variant="cyber" className="mt-6" asChild>
            <Link to="/">Back to store</Link>
          </Button>
        </main>
      </div>
    );
  }

  const fields: Array<{ key: keyof FormState; label: string; type?: string }> = [
    { key: "model", label: "Model name" },
    { key: "price", label: "Price (USD)", type: "number" },
    { key: "image_url", label: "Image URL", type: "url" },
    { key: "cpu", label: "CPU" },
    { key: "gpu", label: "GPU" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
  ];

  return (
    <div className="min-h-screen grid-bg">
      <NeonNav />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black tracking-widest text-rgb sm:text-3xl">
              MANAGE CATALOG
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {laptops.length} units in inventory · signed in as {user.email}
            </p>
          </div>
          <Button
            variant="neon"
            onClick={() => {
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus /> Add laptop
          </Button>
        </div>

        {open && (
          <section className="neon-panel mt-6 animate-rise rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm uppercase tracking-widest text-secondary">
                {form.id ? "Edit laptop" : "New laptop"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                <X />
              </Button>
            </div>
            <form
              className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(form);
              }}
            >
              {fields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  <Input
                    id={f.key}
                    type={f.type ?? "text"}
                    required
                    value={String(form[f.key] ?? "")}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {["Ultra Gaming", "Mid-Range", "Budget"].map((c) => (
                    <option key={c} value={c} className="bg-card">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-4">
                <Button variant="whatsapp" type="submit" disabled={save.isPending}>
                  {save.isPending ? "Saving…" : form.id ? "Save changes" : "Add to catalog"}
                </Button>
              </div>
            </form>
          </section>
        )}

        <section className="neon-panel mt-6 overflow-x-auto rounded-xl">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="font-display text-[11px] uppercase tracking-widest text-secondary">
              <tr className="border-b border-border">
                <th className="p-3">Model</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">CPU</th>
                <th className="p-3">GPU</th>
                <th className="p-3">RAM</th>
                <th className="p-3">Storage</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={8}>
                    Loading inventory…
                  </td>
                </tr>
              )}
              {laptops.map((l) => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-muted/40">
                  <td className="p-3 font-medium text-foreground">{l.model}</td>
                  <td className="p-3 text-primary">{l.category}</td>
                  <td className="p-3 text-accent">{formatPrice(l.price)}</td>
                  <td className="p-3 text-muted-foreground">{l.cpu}</td>
                  <td className="p-3 text-muted-foreground">{l.gpu}</td>
                  <td className="p-3 text-muted-foreground">{l.ram}</td>
                  <td className="p-3 text-muted-foreground">{l.storage}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="cyber"
                        size="icon"
                        aria-label={`Edit ${l.model}`}
                        onClick={() => {
                          setForm({ ...l, price: String(l.price) });
                          setOpen(true);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        aria-label={`Delete ${l.model}`}
                        onClick={() => {
                          if (confirm(`Delete ${l.model}?`)) remove.mutate(l.id);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <Button variant="ghost" className="mt-6" onClick={() => router.navigate({ to: "/" })}>
          ← Back to storefront
        </Button>
      </main>
    </div>
  );
}
