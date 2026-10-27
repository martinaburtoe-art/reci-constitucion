-- Índices para las claves foráneas que se consultan al filtrar y eliminar registros relacionados.
CREATE INDEX IF NOT EXISTS idx_material_goals_material_id ON public.material_goals(material_id);
CREATE INDEX IF NOT EXISTS idx_point_materials_material_id ON public.point_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_point_suggestions_point_id ON public.point_suggestions(point_id);
CREATE INDEX IF NOT EXISTS idx_recycling_log_items_log_id ON public.recycling_log_items(log_id);
CREATE INDEX IF NOT EXISTS idx_recycling_log_items_material_id ON public.recycling_log_items(material_id);
CREATE INDEX IF NOT EXISTS idx_recycling_logs_point_id ON public.recycling_logs(point_id);
CREATE INDEX IF NOT EXISTS idx_report_photos_report_id ON public.report_photos(report_id);
CREATE INDEX IF NOT EXISTS idx_reports_point_id ON public.reports(point_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
