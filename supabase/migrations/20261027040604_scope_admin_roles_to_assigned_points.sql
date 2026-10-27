-- Limit delegated admins to the recycling points assigned to them.
-- Only super_admin can manage global materials, schedules, and unassigned reports.
drop policy if exists "points admin write" on public.collection_points;
create policy "points admin write" on public.collection_points for all to authenticated
using (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and admin_id = (select auth.uid())))
with check (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and admin_id = (select auth.uid())));

drop policy if exists "pm admin write" on public.point_materials;
create policy "pm admin write" on public.point_materials for all to authenticated
using (exists (select 1 from public.collection_points cp where cp.id = point_materials.point_id and (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and cp.admin_id = (select auth.uid())))))
with check (exists (select 1 from public.collection_points cp where cp.id = point_materials.point_id and (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and cp.admin_id = (select auth.uid())))));

drop policy if exists "schedules admin" on public.schedules;
create policy "schedules admin" on public.schedules for all to authenticated
using (public.has_role((select auth.uid()), 'super_admin'::public.app_role))
with check (public.has_role((select auth.uid()), 'super_admin'::public.app_role));

drop policy if exists "reports admin delete" on public.reports;
create policy "reports admin delete" on public.reports for delete to authenticated
using (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and exists (select 1 from public.collection_points cp where cp.id = reports.point_id and cp.admin_id = (select auth.uid()))));

drop policy if exists "reports admin update" on public.reports;
create policy "reports admin update" on public.reports for update to authenticated
using (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and exists (select 1 from public.collection_points cp where cp.id = reports.point_id and cp.admin_id = (select auth.uid()))))
with check (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and exists (select 1 from public.collection_points cp where cp.id = reports.point_id and cp.admin_id = (select auth.uid()))));

drop policy if exists "reports own read" on public.reports;
create policy "reports own read" on public.reports for select to authenticated
using ((select auth.uid()) = user_id or public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and exists (select 1 from public.collection_points cp where cp.id = reports.point_id and cp.admin_id = (select auth.uid()))));

drop policy if exists "photos admin delete" on public.report_photos;
create policy "photos admin delete" on public.report_photos for delete to authenticated
using (exists (select 1 from public.reports r where r.id = report_photos.report_id and (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and exists (select 1 from public.collection_points cp where cp.id = r.point_id and cp.admin_id = (select auth.uid()))))));

drop policy if exists "photos read" on public.report_photos;
create policy "photos read" on public.report_photos for select to public
using (exists (select 1 from public.reports r where r.id = report_photos.report_id and (r.publico = true or r.user_id = (select auth.uid()) or public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and exists (select 1 from public.collection_points cp where cp.id = r.point_id and cp.admin_id = (select auth.uid()))))));

drop policy if exists "logs own" on public.recycling_logs;
create policy "logs own" on public.recycling_logs for select to authenticated
using (user_id = (select auth.uid()) or public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and exists (select 1 from public.collection_points cp where cp.id = recycling_logs.point_id and cp.admin_id = (select auth.uid()))));

drop policy if exists "items own read" on public.recycling_log_items;
create policy "items own read" on public.recycling_log_items for select to authenticated
using (exists (select 1 from public.recycling_logs l where l.id = recycling_log_items.log_id and (l.user_id = (select auth.uid()) or public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and exists (select 1 from public.collection_points cp where cp.id = l.point_id and cp.admin_id = (select auth.uid()))))));

-- Point photos are public to view; delegated administrators can write only to their own folder.
drop policy if exists "Admins upload point photos" on storage.objects;
create policy "Admins upload point photos" on storage.objects for insert to authenticated
with check (bucket_id = 'point-photos' and (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and (storage.foldername(name))[1] = (select auth.uid())::text)));

drop policy if exists "Admins update point photos" on storage.objects;
create policy "Admins update point photos" on storage.objects for update to authenticated
using (bucket_id = 'point-photos' and (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and (storage.foldername(name))[1] = (select auth.uid())::text)))
with check (bucket_id = 'point-photos' and (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and (storage.foldername(name))[1] = (select auth.uid())::text)));

drop policy if exists "Admins delete point photos" on storage.objects;
create policy "Admins delete point photos" on storage.objects for delete to authenticated
using (bucket_id = 'point-photos' and (public.has_role((select auth.uid()), 'super_admin'::public.app_role) or (public.has_role((select auth.uid()), 'admin_punto'::public.app_role) and (storage.foldername(name))[1] = (select auth.uid())::text)));
