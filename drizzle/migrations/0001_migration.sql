DROP POLICY IF EXISTS "Anyone can view laptops" ON public.laptops;
DROP POLICY IF EXISTS admin_manage_laptop_images_delete ON storage.objects;
DROP POLICY IF EXISTS admin_manage_laptop_images_insert ON storage.objects;
DROP POLICY IF EXISTS admin_manage_laptop_images_select ON storage.objects;
DROP POLICY IF EXISTS admin_manage_laptop_images_update ON storage.objects;