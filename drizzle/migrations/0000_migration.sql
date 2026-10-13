
CREATE TYPE public.app_role AS ENUM ('usuario','admin_punto','super_admin');
CREATE TYPE public.point_status AS ENUM ('activo','lleno','cerrado');
CREATE TYPE public.report_status AS ENUM ('recibido','en_revision','resuelto','rechazado');
CREATE TYPE public.report_type AS ENUM ('punto_lleno','vandalismo','basura_suelo','microbasural','contenedor_danado','info_incorrecta','otro');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  sector text,
  onboarding_done boolean NOT NULL DEFAULT false,
  monthly_goal_kg numeric NOT NULL DEFAULT 5,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin_punto','super_admin'))
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));

-- prevent users from editing their own points
CREATE OR REPLACE FUNCTION public.protect_profile_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('app.allow_points', true) IS DISTINCT FROM 'on' THEN
    NEW.points := OLD.points;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_protect_points BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_points();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.materials (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  icono text NOT NULL,
  color text NOT NULL,
  preparacion text[] NOT NULL DEFAULT '{}',
  no_acepta text[] NOT NULL DEFAULT '{}',
  unidad text NOT NULL DEFAULT 'unidad',
  kg_pequeno numeric NOT NULL DEFAULT 0.05,
  kg_mediano numeric NOT NULL DEFAULT 0.2,
  kg_grande numeric NOT NULL DEFAULT 0.5,
  co2_por_kg numeric NOT NULL DEFAULT 1,
  orden integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.materials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.materials TO authenticated;
GRANT ALL ON public.materials TO service_role;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materials public read" ON public.materials FOR SELECT USING (true);
CREATE POLICY "materials admin write" ON public.materials FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.collection_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  direccion text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  horario text,
  dias_atencion text,
  dias_retiro text,
  operador text,
  telefono text,
  foto_url text,
  estado public.point_status NOT NULL DEFAULT 'activo',
  nivel_llenado integer NOT NULL DEFAULT 0,
  fuente text,
  verificado boolean NOT NULL DEFAULT false,
  propuesta_lat double precision,
  propuesta_lng double precision,
  propuesta_por uuid,
  propuesta_at timestamptz,
  admin_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collection_points TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.collection_points TO authenticated;
GRANT ALL ON public.collection_points TO service_role;
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "points public read" ON public.collection_points FOR SELECT USING (true);
CREATE POLICY "points admin write" ON public.collection_points FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.propose_location(_point uuid, _lat double precision, _lng double precision)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  UPDATE public.collection_points SET propuesta_lat=_lat, propuesta_lng=_lng, propuesta_por=auth.uid(), propuesta_at=now() WHERE id=_point;
END $$;
CREATE OR REPLACE FUNCTION public.report_fill_level(_point uuid, _level integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  UPDATE public.collection_points SET nivel_llenado = GREATEST(0, LEAST(100,_level)), updated_at=now() WHERE id=_point;
END $$;
REVOKE EXECUTE ON FUNCTION public.propose_location(uuid,double precision,double precision) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.report_fill_level(uuid,integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.propose_location(uuid,double precision,double precision) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_fill_level(uuid,integer) TO authenticated;

CREATE TABLE public.point_materials (
  point_id uuid NOT NULL REFERENCES public.collection_points(id) ON DELETE CASCADE,
  material_id text NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  PRIMARY KEY (point_id, material_id)
);
GRANT SELECT ON public.point_materials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.point_materials TO authenticated;
GRANT ALL ON public.point_materials TO service_role;
ALTER TABLE public.point_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm public read" ON public.point_materials FOR SELECT USING (true);
CREATE POLICY "pm admin write" ON public.point_materials FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.recycling_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  point_id uuid REFERENCES public.collection_points(id) ON DELETE SET NULL,
  kg_total numeric NOT NULL DEFAULT 0,
  co2_total numeric NOT NULL DEFAULT 0,
  puntos integer NOT NULL DEFAULT 0,
  foto_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.recycling_logs TO authenticated;
GRANT ALL ON public.recycling_logs TO service_role;
ALTER TABLE public.recycling_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs own" ON public.recycling_logs FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "logs insert own" ON public.recycling_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND puntos <= 500);
CREATE POLICY "logs delete own" ON public.recycling_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.recycling_log_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid NOT NULL REFERENCES public.recycling_logs(id) ON DELETE CASCADE,
  material_id text NOT NULL REFERENCES public.materials(id),
  tamano text NOT NULL DEFAULT 'mediano',
  cantidad integer NOT NULL DEFAULT 1,
  kg numeric NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT ON public.recycling_log_items TO authenticated;
GRANT ALL ON public.recycling_log_items TO service_role;
ALTER TABLE public.recycling_log_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items own read" ON public.recycling_log_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.recycling_logs l WHERE l.id = log_id AND (l.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "items own insert" ON public.recycling_log_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.recycling_logs l WHERE l.id = log_id AND l.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.add_log_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.allow_points','on', true);
  UPDATE public.profiles SET points = points + NEW.puntos WHERE id = NEW.user_id;
  PERFORM set_config('app.allow_points','off', true);
  RETURN NEW;
END $$;
CREATE TRIGGER on_log_created AFTER INSERT ON public.recycling_logs FOR EACH ROW EXECUTE FUNCTION public.add_log_points();

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text || clock_timestamp()::text),1,6)),
  user_id uuid,
  point_id uuid REFERENCES public.collection_points(id) ON DELETE SET NULL,
  tipo public.report_type NOT NULL,
  descripcion text,
  lat double precision,
  lng double precision,
  estado public.report_status NOT NULL DEFAULT 'recibido',
  publico boolean NOT NULL DEFAULT false,
  consentimiento boolean NOT NULL DEFAULT false,
  historial jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports public approved" ON public.reports FOR SELECT USING (publico = true);
CREATE POLICY "reports own read" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "reports insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND consentimiento = true AND publico = false AND estado = 'recibido');
CREATE POLICY "reports admin update" ON public.reports FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "reports admin delete" ON public.reports FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.track_report(_codigo text)
RETURNS TABLE (codigo text, tipo public.report_type, estado public.report_status, historial jsonb, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.codigo, r.tipo, r.estado, r.historial, r.created_at FROM public.reports r WHERE r.codigo = upper(_codigo)
$$;
GRANT EXECUTE ON FUNCTION public.track_report(text) TO anon, authenticated;

CREATE TABLE public.report_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.report_photos TO anon;
GRANT SELECT, INSERT, DELETE ON public.report_photos TO authenticated;
GRANT ALL ON public.report_photos TO service_role;
ALTER TABLE public.report_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos read" ON public.report_photos FOR SELECT USING (EXISTS (SELECT 1 FROM public.reports r WHERE r.id = report_id AND (r.publico OR r.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "photos insert own" ON public.report_photos FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.reports r WHERE r.id = report_id AND r.user_id = auth.uid()));
CREATE POLICY "photos admin delete" ON public.report_photos FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector text NOT NULL,
  tipo text NOT NULL DEFAULT 'retiro',
  titulo text NOT NULL,
  descripcion text,
  dia_semana integer,
  fecha date,
  hora text,
  referencial boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schedules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.schedules TO authenticated;
GRANT ALL ON public.schedules TO service_role;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules read" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "schedules admin" ON public.schedules FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.badges (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  descripcion text NOT NULL,
  icono text NOT NULL,
  regla text NOT NULL,
  umbral numeric NOT NULL
);
GRANT SELECT ON public.badges TO anon, authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges read" ON public.badges FOR SELECT USING (true);

CREATE TABLE public.user_badges (
  user_id uuid NOT NULL,
  badge_id text NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);
GRANT SELECT, INSERT ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ub own read" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ub own insert" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Storage policies (buckets are private)
CREATE POLICY "report photos read" ON storage.objects FOR SELECT USING (
  bucket_id = 'report-photos' AND EXISTS (
    SELECT 1 FROM public.report_photos rp JOIN public.reports r ON r.id = rp.report_id
    WHERE rp.path = storage.objects.name AND (r.publico OR r.user_id = auth.uid() OR public.is_admin(auth.uid()))
  ) OR (bucket_id = 'report-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
);
CREATE POLICY "report photos upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'report-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "log photos own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'log-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "log photos upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'log-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

INSERT INTO public.materials (id,nombre,icono,color,preparacion,no_acepta,unidad,kg_pequeno,kg_mediano,kg_grande,co2_por_kg,orden) VALUES
('vidrio','Vidrio','wine','#2E9D6A',ARRAY['Enjuaga el envase','Retira tapas metálicas o plásticas'],ARRAY['Espejos','Ampolletas','Vidrio de ventana','Cerámica'],'botella',0.2,0.4,0.7,0.3,1),
('pet','Plástico PET/HDPE','cup-soda','#2B7FD9',ARRAY['Enjuaga y escurre','Aplasta la botella','Deja la tapa aparte'],ARRAY['Bolsas plásticas','Envases con aceite','Plumavit'],'botella',0.02,0.035,0.06,1.5,2),
('carton','Cartón','package','#B07A3C',ARRAY['Desarma y aplasta las cajas','Retira cintas y plumavit'],ARRAY['Cartón con grasa (cajas de pizza)','Cartón mojado'],'caja',0.15,0.4,1.0,0.9,3),
('papel','Papel','file-text','#8C9AA6',ARRAY['Seco y limpio','Sin corchetes ni espirales'],ARRAY['Servilletas usadas','Papel plastificado','Boletas térmicas'],'paquete',0.05,0.25,1.0,1.0,4),
('latas','Latas y metales','beer','#7D8791',ARRAY['Enjuaga','Aplasta las latas'],ARRAY['Aerosoles con contenido','Pinturas'],'lata',0.015,0.04,0.3,8.0,5),
('tetra','Tetra Pak','milk','#E3A21A',ARRAY['Enjuaga','Abre, aplana y dobla'],ARRAY['Envases con restos de comida'],'envase',0.025,0.03,0.04,1.0,6),
('pilas','Pilas','battery','#D9473B',ARRAY['Guárdalas en un frasco seco','Cubre los polos de pilas de litio con cinta'],ARRAY['Baterías de auto'],'pila',0.02,0.05,0.1,0.5,7),
('aceite','Aceite usado','droplet','#C98A12',ARRAY['Deja enfriar','Guárdalo en botella plástica cerrada'],ARRAY['Aceite de motor mezclado','Agua'],'litro',0.45,0.9,4.5,2.5,8),
('electronicos','Residuos electrónicos','smartphone','#6B5BD6',ARRAY['Borra tus datos personales','Entrega completo, sin desarmar'],ARRAY['Equipos con fugas'],'equipo',0.2,2.0,10.0,2.0,9),
('textil','Ropa y textil','shirt','#D35E95',ARRAY['Lava y seca','Entrega en bolsa cerrada'],ARRAY['Ropa mojada o con hongos'],'prenda',0.2,0.5,1.2,3.0,10),
('voluminosos','Voluminosos','sofa','#5C6B73',ARRAY['Solo en campañas o con retiro agendado','No los dejes en la calle antes del día'],ARRAY['Escombros','Residuos peligrosos'],'objeto',5,15,40,0.5,11);

INSERT INTO public.badges (id,nombre,descripcion,icono,regla,umbral) VALUES
('primer','Primer paso','Registraste tu primer reciclaje','sprout','logs',1),
('diez','Constante','10 registros de reciclaje','repeat','logs',10),
('kg10','10 kilos','Reciclaste 10 kg estimados','weight','kg',10),
('kg50','Medio quintal','Reciclaste 50 kg estimados','trophy','kg',50),
('racha3','Racha de 3 semanas','Reciclaste 3 semanas seguidas','flame','racha',3);

INSERT INTO public.schedules (sector,tipo,titulo,descripcion,dia_semana,hora,referencial) VALUES
('Centro','retiro','Retiro domiciliario','Horario referencial. Confirma con la Municipalidad.',1,'20:00',true),
('Centro','retiro','Retiro domiciliario','Horario referencial.',4,'20:00',true),
('Cerro O''Higgins','retiro','Retiro domiciliario','Horario referencial.',2,'08:00',true),
('Cerro O''Higgins','retiro','Retiro domiciliario','Horario referencial.',5,'08:00',true),
('Santa Teresa','retiro','Retiro domiciliario','Horario referencial.',3,'09:00',true),
('Costanera','retiro','Retiro domiciliario','Horario referencial.',6,'09:00',true);
INSERT INTO public.schedules (sector,tipo,titulo,descripcion,fecha,hora,referencial) VALUES
('Todos','campana','Campaña retiro de voluminosos','Ejemplo referencial: muebles, colchones y electrodomésticos.', (current_date + 12),'09:00',true),
('Todos','evento','Feria de reciclaje en Plaza de Armas','Evento de ejemplo (referencial).', (current_date + 20),'10:00',true);

WITH p AS (
  INSERT INTO public.collection_points (nombre,direccion,lat,lng,horario,dias_atencion,operador,estado,fuente,verificado) VALUES
  ('Punto Plaza de Armas','Plaza de Armas, Constitución',-35.3331,-72.4117,'Por confirmar','Por confirmar','Municipalidad de Constitución (por confirmar)','activo','Ubicación aproximada del centro cívico; por confirmar en terreno',false),
  ('Punto Municipalidad','Edificio municipal, centro de Constitución',-35.3327,-72.4125,'Por confirmar','Lun a Vie (por confirmar)','Municipalidad de Constitución (por confirmar)','activo','Ubicación aproximada; por confirmar en terreno',false),
  ('Punto Costanera','Sector costanera del río Maule',-35.3305,-72.4180,'Por confirmar','Por confirmar','Por confirmar','activo','Ubicación aproximada; por confirmar en terreno',false)
  RETURNING id, nombre
)
INSERT INTO public.point_materials (point_id, material_id)
SELECT p.id, m FROM p, unnest(CASE p.nombre
  WHEN 'Punto Plaza de Armas' THEN ARRAY['vidrio','pet','latas','carton']
  WHEN 'Punto Municipalidad' THEN ARRAY['pilas','electronicos','papel']
  ELSE ARRAY['vidrio','pet','tetra'] END) AS m;
