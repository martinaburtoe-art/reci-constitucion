import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { APP_NAME, ESTADO_LABEL, type PointLite } from "@/lib/app";
import { BottomNav } from "@/components/BottomNav";
import { X, Clock, MapPin } from "lucide-react";

const PointsMap = lazy(() => import("@/components/PointsMap"));

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
    .select("id,nombre,direccion,lat,lng,horario,estado,nivel_llenado,verificado,point_materials(material_id)");
  if (error) throw error;
  return (data ?? []).map((p: any) => ({ ...p, materiales: p.point_materials.map((m: any) => m.material_id) }));
}

function Index() {
  const { data: points = [] } = useQuery({ queryKey: ["points"], queryFn: fetchPoints });
  const { data: materials = [] } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => (await supabase.from("materials").select("id,nombre,color").order("orden")).data ?? [],
  });
  const [filter, setFilter] = useState<string | null>(null);
  const [sel, setSel] = useState<PointLite | null>(null);
  const shown = useMemo(() => (filter ? points.filter((p) => p.materiales.includes(filter)) : points), [points, filter]);
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
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <Chip active={!filter} onClick={() => setFilter(null)}>Todos</Chip>
            {materials.map((m) => (
              <Chip key={m.id} active={filter === m.id} onClick={() => setFilter(m.id)}>{m.nombre}</Chip>
            ))}
          </div>
        </div>
      </header>

      {sel && (
        <div className="absolute inset-x-0 bottom-16 z-[1000] p-3">
          <div className="mx-auto max-w-md rounded-2xl bg-card p-4 shadow-float">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold">{sel.nombre}</h2>
                <p className="text-sm text-muted-foreground">
                  {ESTADO_LABEL[sel.estado]} · {sel.nivel_llenado}% lleno {sel.verificado ? "· Verificado" : "· Referencial"}
                </p>
              </div>
              <button onClick={() => setSel(null)} aria-label="Cerrar"><X className="h-5 w-5" /></button>
            </div>
            {sel.direccion && <p className="mt-2 flex gap-1 text-sm"><MapPin className="h-4 w-4" />{sel.direccion}</p>}
            {sel.horario && <p className="mt-1 flex gap-1 text-sm"><Clock className="h-4 w-4" />{sel.horario}</p>}
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
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
    >{children}</button>
  );
}
