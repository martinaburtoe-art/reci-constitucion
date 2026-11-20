import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { APP_NAME, ESTADO_LABEL, type PointLite } from "@/lib/app";
import { BottomNav } from "@/components/BottomNav";
import { PointSuggestion } from "@/components/PointSuggestion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Clock, MapPin } from "lucide-react";

const PointsMap = lazy(() => import("@/components/PointsMap"));

const LOCAL_RECYCLING_SERVICES = [
  {
    id: "desafio-verde",
    name: "Desafío Verde",
    kind: "Centro de reciclaje y retiro domiciliario",
    address: "Av. Santa María 470, Constitución",
    hours: "Lunes a viernes: 09:00–12:00 y 15:00–18:00",
    phone: "+56 2 2710 0739",
    materials: "Vidrio, botellas plásticas, papel, cartón y latas (confirmar aceptación antes de llevar).",
    source: "https://desafioverde.cl/",
    sourceLabel: "Sitio oficial",
    mapsQuery: "Desafío Verde, Avenida Santa María 470, Constitución, Chile",
    note: "La organización también ofrece retiros programados por sectores. Consulta disponibilidad y materiales antes de acudir.",
  },
  {
    id: "conti-recicla",
    name: "Conti Recicla",
    kind: "Gestor / iniciativa local de reciclaje",
    address: "Calle Río Santa Ana, Constitución",
    hours: "Horario de recepción no publicado; coordinar previamente.",
    phone: "+56 9 8886 2125",
    materials: "Se reportan operativos con vidrio, botellas plásticas, latas y cartón; confirmar recepción actual.",
    source: "https://www.google.com/maps/search/?api=1&query=Conti+Recicla+Constitucion+Maule",
    sourceLabel: "Ficha y ubicación",
    mapsQuery: "Conti Recicla, Calle Río Santa Ana, Constitución, Chile",
    note: "La dirección publicada es referencial y no identifica un número de calle. Llama antes de desplazarte.",
  },
] as const;


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${APP_NAME} · Puntos de reciclaje en Constitución` },
      { name: "description", content: "Encuentra puntos limpios y de reciclaje en Constitución, Maule." },
      { property: "og:title", content: `${APP_NAME} · Reciclaje en Constitución` },
      { property: "og:description", content: "Mapa de puntos de reciclaje de Constitución." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

async function fetchPoints(): Promise<PointLite[]> {
  const { data, error } = await supabase
    .from("collection_points")
    .select("id,nombre,direccion,lat,lng,horario,estado,nivel_llenado,verificado,fuente,foto_url,operador,telefono,dias_atencion,dias_retiro,point_materials(material_id)");
  if (error) throw error;
  return (data ?? []).map((p: any) => ({ ...p, materiales: p.point_materials.map((m: any) => m.material_id) }));
}

function Index() {
  const { data: points = [], isError: pointsError } = useQuery({ queryKey: ["points"], queryFn: fetchPoints });
  const { data: materials = [] } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => (await supabase.from("materials").select("id,nombre,color").order("orden")).data ?? [],
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [sel, setSel] = useState<PointLite | null>(null);
  const shown = useMemo(() => points.filter(p => (!filter || p.materiales.includes(filter)) && `${p.nombre} ${p.direccion ?? ""}`.toLowerCase().includes(search.toLowerCase())), [points, filter, search]);
  const onSelect = useCallback((p: PointLite) => setSel(p), []);
  const matName = (id: string) => materials.find((m) => m.id === id)?.nombre ?? id;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <ClientOnly fallback={<div className="h-full bg-muted" />}>
        <Suspense fallback={<div className="h-full bg-muted" />}>
          <PointsMap points={shown} onSelect={onSelect} />
        </Suspense>
      </ClientOnly>

      <header className="absolute inset-x-0 top-0 z-[1000] p-3">
        <div className="mx-auto max-w-md rounded-2xl bg-card/95 p-3 shadow-float backdrop-blur">
          <h1 className="font-display text-2xl font-bold text-leaf-dark">{APP_NAME}</h1>
          <Input className="mt-2" aria-label="Buscar punto" placeholder="Buscar punto o dirección" value={search} onChange={e=>setSearch(e.target.value)} />
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <Chip active={!filter} onClick={() => setFilter(null)}>Todos</Chip>
            {materials.map((m) => (
              <Chip key={m.id} active={filter === m.id} onClick={() => setFilter(m.id)}>{m.nombre}</Chip>
            ))}
          </div>
        </div>
      </header>

      {pointsError ? (
        <div role="alert" className="absolute inset-x-3 top-36 z-[900] mx-auto max-w-md rounded-2xl border bg-card/95 p-4 shadow-float backdrop-blur">
          <h2 className="font-semibold">No pudimos cargar los puntos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Revisa tu conexión e inténtalo nuevamente. No mostraremos ubicaciones que no hayamos podido consultar.</p>
        </div>
      ) : points.length === 0 ? (
        <div role="status" className="absolute inset-x-3 top-36 z-[900] mx-auto max-w-md rounded-2xl border bg-card/95 p-4 shadow-float backdrop-blur">
          <h2 className="font-semibold">Estamos actualizando el catastro</h2>
          <p className="mt-1 text-sm text-muted-foreground">Todavía no hay puntos de reciclaje confirmados para publicar en el mapa. Preferimos verificar la información antes de enviarte a una ubicación incorrecta.</p>
        </div>
      ) : null}

      <section aria-label="Directorio local de reciclaje" className="absolute inset-x-3 bottom-[4.7rem] z-[900] mx-auto max-w-md max-h-[38dvh] overflow-y-auto rounded-2xl border bg-card/95 p-3 shadow-float backdrop-blur">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold">Dónde reciclar en Constitución</h2>
            <p className="text-xs text-muted-foreground">Lugares y gestores locales · confirma antes de ir</p>
          </div>
          <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold">2 referencias</span>
        </div>
        <div className="space-y-2">
          {LOCAL_RECYCLING_SERVICES.map((service) => (
            <article key={service.id} className="rounded-xl border bg-background/80 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">{service.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{service.kind}</p>
                </div>
                <a className="shrink-0 text-xs font-semibold text-primary underline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.mapsQuery)}`} target="_blank" rel="noreferrer">Cómo llegar</a>
              </div>
              <p className="mt-1 text-xs">{service.address}</p>
              <p className="mt-1 text-xs text-muted-foreground">{service.hours}</p>
              <p className="mt-1 text-xs text-muted-foreground">{service.materials}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{service.note}</p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <a className="font-medium text-primary underline" href={`tel:${service.phone.replace(/[^+0-9]/g, "")}`}>{service.phone}</a>
                <a className="font-medium text-primary underline" href={service.source} target="_blank" rel="noreferrer">{service.sourceLabel}</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {sel && (
        <div className="absolute inset-x-0 bottom-16 max-h-[65dvh] overflow-y-auto z-[1000] p-3">
          <div className="mx-auto max-w-md rounded-2xl bg-card p-4 shadow-float">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold">{sel.nombre}</h2>
                <p className="text-sm text-muted-foreground">
                  {ESTADO_LABEL[sel.estado]} · {sel.nivel_llenado}% lleno {sel.verificado ? "· Verificado" : "· Ubicación por confirmar"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSel(null)} aria-label="Cerrar"><X className="h-5 w-5" /></Button>
            </div>
            {sel.foto_url&&<img src={sel.foto_url} alt={`Foto de ${sel.nombre}`} loading="lazy" className="mt-3 max-h-48 w-full rounded-xl object-cover"/>}
            <p className="mt-2 text-xs text-muted-foreground">Fuente: {sel.fuente ?? "Sin fuente oficial — no verificado"}</p>
            {sel.direccion && <p className="mt-2 flex gap-1 text-sm"><MapPin className="h-4 w-4" />{sel.direccion}</p>}
            {sel.horario && <p className="mt-1 flex gap-1 text-sm"><Clock className="h-4 w-4" />{sel.horario}</p>}
            {sel.dias_atencion&&<p className="mt-1 text-sm">Atención: {sel.dias_atencion}</p>}
            {sel.dias_retiro&&<p className="mt-1 text-sm">Días de retiro: {sel.dias_retiro}</p>}
            {sel.operador&&<p className="mt-1 text-sm">Operador: {sel.operador}</p>}
            {sel.telefono&&<p className="mt-1 text-sm">Contacto: <a className="text-primary underline" href={`tel:${sel.telefono}`}>{sel.telefono}</a></p>}
            <div className="mt-2 flex flex-wrap gap-1">
              {sel.materiales.map((m) => (
                <span key={m} className="rounded-full bg-secondary px-2 py-0.5 text-xs">{matName(m)}</span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <a
                className="flex-1 rounded-xl border border-border py-2 text-center text-sm font-semibold"
                href={`https://www.google.com/maps/dir/?api=1&destination=${sel.lat},${sel.lng}`}
                target="_blank" rel="noreferrer"
              >Cómo llegar</a>
              <Link to="/registrar" search={{ punto: sel.id }} className="flex-1 rounded-xl bg-primary py-2 text-center text-sm font-semibold text-primary-foreground">
                Reciclé aquí
              </Link>
            </div>
            <PointSuggestion point={sel.id} materials={materials} />
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      variant={active ? "default" : "secondary"}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
    >{children}</Button>
  );
}
