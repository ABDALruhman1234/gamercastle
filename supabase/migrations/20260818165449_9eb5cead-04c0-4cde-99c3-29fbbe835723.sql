
CREATE POLICY "admin_manage_laptop_images_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'laptop-images' AND lower(coalesce(auth.jwt() ->> 'email','')) = 'a16268455@gmail.com');

CREATE POLICY "admin_manage_laptop_images_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'laptop-images' AND lower(coalesce(auth.jwt() ->> 'email','')) = 'a16268455@gmail.com');

CREATE POLICY "admin_manage_laptop_images_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'laptop-images' AND lower(coalesce(auth.jwt() ->> 'email','')) = 'a16268455@gmail.com')
WITH CHECK (bucket_id = 'laptop-images' AND lower(coalesce(auth.jwt() ->> 'email','')) = 'a16268455@gmail.com');

CREATE POLICY "admin_manage_laptop_images_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'laptop-images' AND lower(coalesce(auth.jwt() ->> 'email','')) = 'a16268455@gmail.com');
