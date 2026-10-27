-- Keep public photo access limited to reports explicitly approved for publication.
-- Role-checking functions are not executable by anon, so anonymous policies must not call them.
drop policy if exists "photos read" on public.report_photos;
drop policy if exists "photos public read" on public.report_photos;
create policy "photos public read"
on public.report_photos for select to anon
using (
  exists (
    select 1 from public.reports r
    where r.id = report_photos.report_id and r.publico = true
  )
);

drop policy if exists "photos authenticated read" on public.report_photos;
create policy "photos authenticated read"
on public.report_photos for select to authenticated
using (
  exists (
    select 1 from public.reports r
    where r.id = report_photos.report_id
      and (
        r.publico = true
        or r.user_id = (select auth.uid())
        or public.has_role((select auth.uid()), 'super_admin'::public.app_role)
        or (
          public.has_role((select auth.uid()), 'admin_punto'::public.app_role)
          and exists (
            select 1 from public.collection_points cp
            where cp.id = r.point_id and cp.admin_id = (select auth.uid())
          )
        )
      )
  )
);

drop policy if exists "report photos read" on storage.objects;
drop policy if exists "report photos public read" on storage.objects;
create policy "report photos public read"
on storage.objects for select to anon
using (
  bucket_id = 'report-photos'
  and exists (
    select 1 from public.report_photos rp
    join public.reports r on r.id = rp.report_id
    where rp.path = objects.name and r.publico = true
  )
);

drop policy if exists "report photos authenticated read" on storage.objects;
create policy "report photos authenticated read"
on storage.objects for select to authenticated
using (
  bucket_id = 'report-photos'
  and (
    exists (
      select 1 from public.report_photos rp
      join public.reports r on r.id = rp.report_id
      where rp.path = objects.name
        and (
          r.publico = true
          or r.user_id = (select auth.uid())
          or public.has_role((select auth.uid()), 'super_admin'::public.app_role)
          or (
            public.has_role((select auth.uid()), 'admin_punto'::public.app_role)
            and exists (
              select 1 from public.collection_points cp
              where cp.id = r.point_id and cp.admin_id = (select auth.uid())
            )
          )
        )
    )
    or (storage.foldername(name))[1] = (select auth.uid())::text
  )
);
