CREATE TABLE public.laptops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Mid-Range',
  cpu text NOT NULL DEFAULT '',
  gpu text NOT NULL DEFAULT '',
  ram text NOT NULL DEFAULT '',
  storage text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.laptops TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laptops TO authenticated;
GRANT ALL ON public.laptops TO service_role;

ALTER TABLE public.laptops ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_store_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = 'a16268455@gmail.com'
$$;

CREATE POLICY "Anyone can view laptops" ON public.laptops FOR SELECT USING (true);
CREATE POLICY "Admin can insert laptops" ON public.laptops FOR INSERT TO authenticated WITH CHECK (public.is_store_admin());
CREATE POLICY "Admin can update laptops" ON public.laptops FOR UPDATE TO authenticated USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());
CREATE POLICY "Admin can delete laptops" ON public.laptops FOR DELETE TO authenticated USING (public.is_store_admin());

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER laptops_updated_at BEFORE UPDATE ON public.laptops
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.laptops (model, price, image_url, category, cpu, gpu, ram, storage) VALUES
('Predator Helios 18 RGB', 3299, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80', 'Ultra Gaming', 'Intel Core i9-14900HX', 'RTX 4090 16GB', '64GB DDR5', '2TB NVMe SSD'),
('ROG Strix Scar 17 X3D', 3099, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80', 'Ultra Gaming', 'Ryzen 9 7945HX3D', 'RTX 4090 16GB', '32GB DDR5', '2TB NVMe SSD'),
('Alienware M18 Titan', 2899, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80', 'Ultra Gaming', 'Intel Core i9-13980HX', 'RTX 4080 12GB', '32GB DDR5', '1TB NVMe SSD'),
('Razer Blade 18 Neon', 3499, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80', 'Ultra Gaming', 'Intel Core i9-14900HX', 'RTX 4090 16GB', '64GB DDR5', '4TB NVMe SSD'),
('MSI Titan GT77 HX', 3799, 'https://images.unsplash.com/photo-1618410320928-25228d811631?auto=format&fit=crop&w=900&q=80', 'Ultra Gaming', 'Intel Core i9-13980HX', 'RTX 4090 16GB', '64GB DDR5', '4TB NVMe SSD'),
('Lenovo Legion Pro 7i', 2699, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80', 'Ultra Gaming', 'Intel Core i9-14900HX', 'RTX 4080 12GB', '32GB DDR5', '2TB NVMe SSD'),
('Gigabyte Aorus 17X', 2599, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80', 'Ultra Gaming', 'Intel Core i9-13900HX', 'RTX 4080 12GB', '32GB DDR5', '1TB NVMe SSD'),
('HP Omen Max 16 Ultra', 2449, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=80', 'Ultra Gaming', 'Ryzen 9 8945HX', 'RTX 4080 12GB', '32GB DDR5', '2TB NVMe SSD'),
('ROG Zephyrus G16 OLED', 1999, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Intel Core Ultra 9 185H', 'RTX 4070 8GB', '16GB LPDDR5', '1TB NVMe SSD'),
('Legion Slim 5 Gen 9', 1499, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Ryzen 7 8845HS', 'RTX 4060 8GB', '16GB DDR5', '1TB NVMe SSD'),
('Acer Nitro 16 Phantom', 1299, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Ryzen 7 7840HS', 'RTX 4060 8GB', '16GB DDR5', '1TB NVMe SSD'),
('MSI Katana 15 Blade', 1249, 'https://images.unsplash.com/photo-1618410320928-25228d811631?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Intel Core i7-13620H', 'RTX 4060 8GB', '16GB DDR5', '1TB NVMe SSD'),
('Dell G16 Voltage', 1399, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Intel Core i7-13650HX', 'RTX 4060 8GB', '16GB DDR5', '512GB NVMe SSD'),
('HP Victus 16 Pulse', 1199, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Ryzen 7 7840HS', 'RTX 4050 6GB', '16GB DDR5', '1TB NVMe SSD'),
('Asus TUF Gaming A16', 1349, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Ryzen 9 7940HS', 'RTX 4060 8GB', '16GB DDR5', '1TB NVMe SSD'),
('Razer Blade 14 Stealth', 1899, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Ryzen 9 8945HS', 'RTX 4070 8GB', '32GB LPDDR5', '1TB NVMe SSD'),
('Legion 5i Cyber Edition', 1599, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Intel Core i7-14650HX', 'RTX 4060 8GB', '32GB DDR5', '1TB NVMe SSD'),
('Gigabyte G5 Neon', 1099, 'https://images.unsplash.com/photo-1618410320928-25228d811631?auto=format&fit=crop&w=900&q=80', 'Mid-Range', 'Intel Core i7-13620H', 'RTX 4050 6GB', '16GB DDR5', '512GB NVMe SSD'),
('Acer Nitro V 15', 899, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80', 'Budget', 'Intel Core i5-13420H', 'RTX 3050 6GB', '16GB DDR5', '512GB NVMe SSD'),
('Asus TUF F15 Starter', 849, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80', 'Budget', 'Intel Core i5-12500H', 'RTX 3050 4GB', '16GB DDR4', '512GB NVMe SSD'),
('HP Victus 15 Spark', 799, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=80', 'Budget', 'Ryzen 5 7535HS', 'RTX 2050 4GB', '8GB DDR5', '512GB NVMe SSD'),
('MSI Thin 15 Circuit', 879, 'https://images.unsplash.com/photo-1618410320928-25228d811631?auto=format&fit=crop&w=900&q=80', 'Budget', 'Intel Core i5-13420H', 'RTX 3050 6GB', '16GB DDR4', '512GB NVMe SSD'),
('Lenovo LOQ 15 Bolt', 949, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80', 'Budget', 'Ryzen 5 7640HS', 'RTX 4050 6GB', '16GB DDR5', '512GB NVMe SSD'),
('Dell G15 Rookie', 899, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80', 'Budget', 'Intel Core i5-13450HX', 'RTX 3050 6GB', '16GB DDR5', '512GB NVMe SSD');