import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X, Check, PackageOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NeonNav } from "@/components/NeonNav";
import { ADMIN_EMAIL, formatPrice, productsQuery, productSchema, type Product } from "@/lib/products";
import { friendlyError } from "@/lib/laptop-schema";
import { useProductsLive } from "@/hooks/use-products-live";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    const email = context.user.email?.trim().toLowerCase();
    if (email !== ADMIN_EMAIL) {
      toast.error("Access denied — admin only.");
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [
    { title: "Manage Products | OSINT store" },
    { name: "description", content: "Private product management for OSINT store." },
    { property: "og:title", content: "Manage Products | OSINT store" },
    { property: "og:description", content: "Private product management for OSINT store." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

type FormState = { id?: string; name: string; description: string; price: string };
const emptyForm: FormState = { name: "", description: "", price: "" };
function AdminPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [open, setOpen] = useState(false);
  const { data: products = [], isLoading, isError, refetch } = useQuery(productsQuery);
  useProductsLive();
  const save = useMutation({
    mutationFn: async (state: FormState) => {
      const parsed = productSchema.safeParse(state);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the fields.");
      const result = state.id
        ? await supabase.from("products").update(parsed.data).eq("id", state.id).select("id, name, description, price").single()
        : await supabase.from("products").insert(parsed.data).select("id, name, description, price").single();
      if (result.error) throw new Error("Could not save this product. Please try again.");
      return result.data;
    },
    onSuccess: (product, state) => {
      queryClient.setQueryData<Product[]>(["products"], (current = []) => state.id ? current.map((item) => item.id === product.id ? product : item) : [product, ...current]);
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      setForm(emptyForm); setOpen(false);
      toast.success(state.id ? "Product updated" : "Product added");
    },
    onError: (error) => toast.error(error.message.startsWith("Could not") ? friendlyError(error, "Could not save this product. Please try again.") : error.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("products").delete().eq("id", id).select("id").single();
      if (error || !data) throw new Error("Could not delete this product. Please try again.");
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Product[]>(["products"], (current = []) => current.filter((item) => item.id !== id));
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
    onError: () => toast.error("Could not delete this product. Please try again."),
  });
  function edit(product: Product) { setForm({ ...product, price: String(product.price) }); setOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NeonNav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div><h1 className="text-2xl font-bold sm:text-3xl">Manage Products</h1><p className="mt-2 text-sm text-muted-foreground">{products.length} products</p></div>
          <Button variant="secondary" className="h-10" onClick={() => { setForm(emptyForm); setOpen(true); }}><Plus /> Add product</Button>
        </div>
        {open && <section className="border-b border-border py-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">{form.id ? "Edit product" : "New product"}</h2><Button variant="ghost" size="icon" aria-label="Close product form" disabled={save.isPending} onClick={() => setOpen(false)}><X /></Button></div>
          <form className="grid max-w-2xl gap-5" onSubmit={(event) => { event.preventDefault(); save.mutate(form); }}>
            <div className="space-y-2"><Label htmlFor="product-name">Product Name</Label><Input id="product-name" dir="auto" required maxLength={120} value={form.name} disabled={save.isPending} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" dir="auto" required maxLength={4000} rows={5} className="resize-y" disabled={save.isPending} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
            <div className="max-w-xs space-y-2"><Label htmlFor="price">Price</Label><Input id="price" type="number" required min="0" max="1000000" step="0.01" disabled={save.isPending} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></div>
            <div className="flex gap-3"><Button variant="secondary" type="submit" disabled={save.isPending}><Check />{save.isPending ? "Saving…" : "Save product"}</Button><Button variant="outline" type="button" disabled={save.isPending} onClick={() => setOpen(false)}>Cancel</Button></div>
          </form>
        </section>}
        {isLoading ? <p className="py-12 text-muted-foreground">Loading products…</p>
          : isError ? <div className="py-12"><p className="text-muted-foreground">Could not load products.</p><Button variant="outline" className="mt-4" onClick={() => void refetch()}>Try again</Button></div>
          : products.length === 0 ? <div className="flex flex-col items-center py-20 text-muted-foreground"><PackageOpen className="mb-4 size-9" /><p>No products yet.</p></div>
          : <div className="divide-y divide-border">{products.map((product) => <article key={product.id} className="grid min-w-0 gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0"><h2 dir="auto" className="break-words text-lg font-semibold">{product.name}</h2><p dir="auto" className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{product.description}</p><p className="mt-3 font-semibold text-secondary">{formatPrice(product.price)}</p></div>
            <div className="flex items-start gap-2"><Button variant="outline" size="icon" aria-label={`Edit ${product.name}`} title="Edit product" disabled={save.isPending} onClick={() => edit(product)}><Pencil /></Button><Button variant="ghost" size="icon" className="text-destructive" aria-label={`Delete ${product.name}`} title="Delete product" disabled={remove.isPending} onClick={() => { if (confirm(`Delete ${product.name}?`)) remove.mutate(product.id); }}><Trash2 /></Button></div>
          </article>)}</div>}
      </main>
    </div>
  );
}
