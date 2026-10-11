import { MessageCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, whatsappLink, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex min-w-0 flex-col rounded-lg border border-border bg-card/80 p-5 transition-colors hover:border-secondary sm:p-6">
      <h3 dir="auto" className="break-words text-xl font-bold text-foreground">{product.name}</h3>
      <p dir="auto" className="mt-3 flex-1 whitespace-pre-wrap break-words text-base leading-relaxed text-muted-foreground">{product.description}</p>
      <div className="mt-6 border-t border-border pt-4">
        <p className="mb-4 text-2xl font-semibold text-secondary">{formatPrice(product.price)}</p>
        <Button variant="whatsapp" className="h-11 w-full" asChild>
          <a href={whatsappLink(product.name)} target="_blank" rel="noopener noreferrer"><MessageCircle /> طلب عبر واتساب <ArrowUpRight /></a>
        </Button>
      </div>
    </article>
  );
}