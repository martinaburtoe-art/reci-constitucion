-- Bucket público para fotos de puntos de reciclaje; solo administradores pueden escribir.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('point-photos', 'point-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read point photos" on storage.objects;
create policy "Public read point photos"
on storage.objects for select
to public
using (bucket_id = 'point-photos');

drop policy if exists "Admins upload point photos" on storage.objects;
create policy "Admins upload point photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'point-photos' and public.is_admin((select auth.uid())));

drop policy if exists "Admins update point photos" on storage.objects;
create policy "Admins update point photos"
on storage.objects for update
to authenticated
using (bucket_id = 'point-photos' and public.is_admin((select auth.uid())))
with check (bucket_id = 'point-photos' and public.is_admin((select auth.uid())));

drop policy if exists "Admins delete point photos" on storage.objects;
create policy "Admins delete point photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'point-photos' and public.is_admin((select auth.uid())));
