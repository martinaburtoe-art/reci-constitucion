-- Buckets privados usados por las fotos de denuncias y registros de reciclaje.
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', false), ('log-photos', 'log-photos', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
