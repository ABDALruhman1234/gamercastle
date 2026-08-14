import { supabase } from "@/integrations/supabase/client";

export const ADMIN_EMAIL = "a16268455@gmail.com";
export const WHATSAPP_NUMBER = "963959384689";

export const CATEGORIES = ["All", "Ultra Gaming", "Mid-Range", "Budget"] as const;

export type Laptop = {
  id: string;
  model: string;
  price: number;
  image_url: string;
  category: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
};

export const laptopsQuery = {
  queryKey: ["laptops"],
  queryFn: async (): Promise<Laptop[]> => {
    const { data, error } = await supabase
      .from("laptops")
      .select("id, model, price, image_url, category, cpu, gpu, ram, storage")
      .order("price", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Laptop[];
  },
};

export function whatsappLink(model: string) {
  const message = `مرحباً لابتوبات سوريا، أريد طلب جهاز ${model}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(price: number) {
  return `$${Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
