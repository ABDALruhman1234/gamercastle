import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const ADMIN_EMAIL = "a16268455@gmail.com";
export type Product = { id: string; name: string; description: string; price: number };
const text = (label: string, max: number) => z.string().trim().min(1, `${label} is required`).max(max, `${label} must be under ${max} characters`);
export const productSchema = z.object({
  name: text("Product name", 120),
  description: text("Description", 4000),
  price: z.union([z.string().trim().min(1, "Price is required"), z.number()]).transform(Number).pipe(z.number().finite().min(0).max(1000000)),
});
export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("id, name, description, price").order("created_at", { ascending: false });
    if (error) throw new Error("The catalog is unavailable. Please try again.");
    return (data ?? []).map((product) => ({ ...product, price: Number(product.price) }));
  },
  refetchInterval: 5000,
});
export function whatsappLink(name: string) {
  return `https://wa.me/963959384689?text=${encodeURIComponent(`مرحبا أريد طلب ${name}`)}`;
}
export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(price);
}