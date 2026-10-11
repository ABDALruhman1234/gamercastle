import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, ArrowDown, PackageOpen } from "lucide-react";
import { NeonNav } from "@/components/NeonNav";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { productsQuery } from "@/lib/products";
import { useProductsLive } from "@/hooks/use-products-live";
import heroImage from "@/assets/osint-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "OSINT store — تعلم جمع المعلومات بالطريقة الاستخباراتية" },
    { name: "description", content: "OSINT store — تعلم جمع المعلومات بالطريقة الاستخباراتية. تصفح المنتجات واطلب مباشرة عبر واتساب." },
    { property: "og:title", content: "OSINT store — جمع المعلومات" },
    { property: "og:description", content: "تعلم جمع المعلومات بالطريقة الاستخباراتية. تصفح منتجات OSINT store واطلب عبر واتساب." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Storefront,
});

function Storefront() {
  const { data: products = [], isLoading, isError, refetch } = useQuery(productsQuery);
  useProductsLive();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(search.trim().toLowerCase())), [products, search]);
  return (
    <div className="grid-bg min-h-screen text-foreground">
      <NeonNav />
      <main>
        <section className="osint-hero relative isolate overflow-hidden border-b border-border">
          <img src={heroImage} alt="Intelligence research workspace with a map and a network analysis screen" width={1536} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
          <div className="hero-shade absolute inset-0 -z-10" />
          <div className="mx-auto flex min-h-[470px] max-w-7xl flex-col justify-center px-5 py-12 sm:min-h-[510px] sm:px-8 lg:min-h-[560px]">
            <p className="mb-4 font-display text-xs font-semibold uppercase text-accent">OPEN SOURCE INTELLIGENCE</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-6xl lg:text-7xl">OSINT <span className="text-secondary">store</span></h1>
            <p lang="ar" dir="rtl" className="mt-6 max-w-xl text-left font-arabic text-2xl font-semibold leading-relaxed text-foreground sm:text-3xl lg:text-4xl">تعلم جمع المعلومات بالطريقة الاستخباراتية</p>
            <Button variant="cyber" className="mt-8 h-11 w-fit" asChild><a href="#products">تصفح المنتجات <ArrowDown /></a></Button>
          </div>
        </section>
        <section id="products" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-2xl font-bold text-foreground">المنتجات</h2><p className="mt-1 text-sm text-muted-foreground">{isLoading ? "جارٍ التحميل…" : `${filtered.length} منتجات`}</p></div>
            <div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary" /><Input type="search" aria-label="Search products" placeholder="ابحث عن منتج…" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 pl-10" /></div>
          </div>
          {isError ? <div className="py-16 text-center"><p className="text-muted-foreground">تعذر تحميل المنتجات. يرجى المحاولة مجدداً.</p><Button variant="cyber" className="mt-4" onClick={() => void refetch()}>إعادة المحاولة</Button></div>
            : isLoading ? <div className="grid gap-5 py-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading products">{[1,2,3].map((id) => <div key={id} className="h-56 animate-pulse rounded-lg border border-border bg-card/70" />)}</div>
            : filtered.length ? <div className="grid items-stretch gap-5 py-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            : <div className="flex flex-col items-center py-16 text-center text-muted-foreground"><PackageOpen className="mb-4 size-9 text-secondary" /><p>{search ? "لا توجد منتجات تطابق بحثك." : "لا توجد منتجات حالياً."}</p></div>}
        </section>
      </main>
      <footer className="border-t border-border px-5 py-6"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><span className="font-display font-semibold text-foreground">OSINT store</span><span>© {new Date().getFullYear()} OSINT store</span></div></footer>
    </div>
  );
}
