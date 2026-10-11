import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProductsLive() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel("osint-products").on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);
}