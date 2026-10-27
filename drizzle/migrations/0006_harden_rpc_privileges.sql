-- Evita que funciones internas de triggers se expongan como RPC públicas.
REVOKE ALL ON FUNCTION public.add_log_points() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_profile_points() FROM PUBLIC, anon, authenticated;

-- Los helpers de autorización se usan desde RLS y funciones protegidas, no desde sesiones anónimas.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Revisión de propuestas requiere una sesión autenticada; los checks internos validan rol y propiedad.
REVOKE ALL ON FUNCTION public.review_suggestion(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_suggestion(uuid, boolean) TO authenticated;

-- Las claves push y las entregas son solo de servicio, nunca RPC o tablas para usuarios finales.
REVOKE ALL ON public.push_keys, public.push_deliveries FROM PUBLIC, anon, authenticated;
