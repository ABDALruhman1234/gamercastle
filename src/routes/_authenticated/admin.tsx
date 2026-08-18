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
import { friendlyError, laptopSchema, safeImageUrl } from "@/lib/laptop-schema";


export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    const email = (context as { user?: { email?: string } }).user?.email?.trim().toLowerCase();
    if (email !== ADMIN_EMAIL) {
      toast.error("Access denied — admin only.");
      throw redirect({ to: "/" });
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
      const parsed = laptopSchema.safeParse({
        model: state.model,
        price: state.price,
        image_url: state.image_url,
        category: state.category,
        cpu: state.cpu,
        gpu: state.gpu,
        ram: state.ram,
        storage: state.storage,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Please check the form fields.");
      }
      const payload = parsed.data;
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
    onError: (e: unknown) => toast.error(friendlyError(e, "Could not save this laptop.")),
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
    onError: (e: unknown) => toast.error(friendlyError(e, "Could not delete this laptop.")),
  });





  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${crypto.randomUUID()}.${ext || "jpg"}`;
      const { error: upErr } = await supabase.storage
        .from("laptop-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data, error: urlErr } = await supabase.storage
        .from("laptop-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (urlErr || !data?.signedUrl) throw urlErr ?? new Error("no url");
      const url = new URL(data.signedUrl, window.location.origin).toString();
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(friendlyError(e, "Could not upload this image."));
    } finally {
      setUploading(false);
    }
  }

  const fields: Array<{ key: keyof FormState; label: string; type?: string }> = [
    { key: "model", label: "Model name" },
    { key: "price", label: "Price (USD)", type: "number" },
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
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="image_file">Laptop image</Label>
                <div className="flex items-center gap-3">
                  {form.image_url ? (
                    <img
                      src={safeImageUrl(form.image_url)}
                      alt="Selected laptop preview"
                      className="size-14 shrink-0 rounded-md border border-border object-cover"
                    />
                  ) : null}
                  <input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border file:border-secondary/60 file:bg-secondary/10 file:px-3 file:py-2 file:text-xs file:text-secondary"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFile(file);
                      e.target.value = "";
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {uploading
                    ? "Uploading image…"
                    : form.image_url
                      ? "Image ready."
                      : "Choose an image from your device (max 5 MB)."}
                </p>
              </div>
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
