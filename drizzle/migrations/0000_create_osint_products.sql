CREATE TABLE public.products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
 description text NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 4000),
 price numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0 AND price <= 1000000),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_store_admin());
CREATE POLICY "Admin can update products" ON public.products FOR UPDATE TO authenticated USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());
CREATE POLICY "Admin can delete products" ON public.products FOR DELETE TO authenticated USING (public.is_store_admin());
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
COMMENT ON TABLE public.laptops IS 'DEPRECATED: replaced by public.products for the OSINT catalog';
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;