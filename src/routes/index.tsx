import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Zap } from "lucide-react";
import { NeonNav } from "@/components/NeonNav";
import { LaptopCard } from "@/components/LaptopCard";
import { Input } from "@/components/ui/input";
import { CATEGORIES, laptopsQuery } from "@/lib/laptops";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Professional Store — Cyberpunk Gaming Laptops" },
      {
        name: "description",
        content:
          "Shop RTX gaming laptops at Professional Store. Ultra Gaming, Mid-Range and Budget rigs with instant WhatsApp ordering.",
      },
      { property: "og:title", content: "Professional Store — Cyberpunk Gaming Laptops" },
      {
        property: "og:description",
        content:
          "Shop RTX gaming laptops at Professional Store. Ultra Gaming, Mid-Range and Budget rigs with instant WhatsApp ordering.",
      },
    ],
  }),
  component: Storefront,
});

function Storefront() {
  const { data: laptops = [], isLoading } = useQuery(laptopsQuery);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return laptops.filter((l) => {
      const inCategory = category === "All" || l.category === category;
      const inSearch =
        !q ||
        [l.model, l.cpu, l.gpu, l.ram, l.storage, l.category]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return inCategory && inSearch;
    });
  }, [laptops, search, category]);

  return (
    <div className="min-h-screen grid-bg">
      <NeonNav />

      <main>
        <section className="relative overflow-hidden border-b border-border/60 px-4 py-20 text-center sm:py-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/50 px-4 py-1 font-display text-[10px] uppercase tracking-[0.3em] text-accent shadow-[var(--glow-lime)]">
              <Zap className="size-3" /> RTX 40 Series In Stock
            </span>
            <h1 className="animate-flicker mt-6 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-rgb">LEVEL UP YOUR GEAR</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Hand-picked gaming laptops built for maximum frames. Order any rig instantly over
              WhatsApp.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="neon-panel flex flex-col gap-4 rounded-xl p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary" />
              <Input
                type="search"
                aria-label="Search laptops"
                placeholder="Search by model, GPU, CPU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 font-display text-[11px] uppercase tracking-widest transition-all",
                    category === c
                      ? "border-primary bg-primary/15 text-primary shadow-[var(--glow-pink)]"
                      : "border-border text-muted-foreground hover:border-secondary hover:text-secondary",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 font-display text-xs uppercase tracking-widest text-muted-foreground">
            {isLoading ? "Scanning inventory…" : `${filtered.length} units found`}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((laptop) => (
              <LaptopCard key={laptop.id} laptop={laptop} />
            ))}
          </div>

          {!isLoading && filtered.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">
              No rigs match that search. Try another keyword.
            </p>
          )}
        </section>
      </main>

      <footer className="border-t border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Professional Store · Gaming hardware, delivered.
      </footer>
    </div>
  );
}
