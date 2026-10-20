CREATE OR REPLACE FUNCTION public.public_impact_metrics()
RETURNS TABLE(total_kg numeric, total_co2 numeric, total_registros bigint, puntos_activos bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    COALESCE((SELECT SUM(kg_total) FROM public.recycling_logs), 0)::numeric,
    COALESCE((SELECT SUM(co2_total) FROM public.recycling_logs), 0)::numeric,
    (SELECT COUNT(*) FROM public.recycling_logs)::bigint,
    (SELECT COUNT(*) FROM public.collection_points WHERE estado = 'activo' AND verificado = true)::bigint;
$$;

REVOKE ALL ON FUNCTION public.public_impact_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_impact_metrics() TO anon, authenticated;
