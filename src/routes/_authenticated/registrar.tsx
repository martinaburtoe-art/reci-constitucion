import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/features";
import { enqueue } from "@/lib/offline";
import confetti from "canvas-confetti";
import { APP_NAME } from "@/lib/app";
import { BottomNav } from "@/components/BottomNav";
import { Reci } from "@/components/Reci";
import { Button } from "@/components/ui/button";

type Size = "pequeno" | "mediano" | "grande";
const SIZE_LABEL: Record<Size, string> = { pequeno: "Pequeño", mediano: "Mediano", grande: "Grande" };

export const Route = createFileRoute("/_authenticated/registrar")({
  validateSearch: (s: Record<string, unknown>) => ({ punto: typeof s['punto'] === "string" ? (s['punto'] as string) : undefined }),
  head: () => pageHead("Registrar reciclaje", "Registra materiales y suma tu impacto en Constitución."),
  component: Registrar,
});

function Registrar() {
  const { punto } = Route.useSearch();
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [pointId, setPointId] = useState(punto ?? "");
  const [items, setItems] = useState<Record<string, { size: Size; n: number }>>({});
  const [busy, setBusy] = useState(false);

  const { data: materials = [] } = useQuery({
    queryKey: ["materials-full"],
    queryFn: async () => (await supabase.from("materials").select("*").order("orden")).data ?? [],
  });
  const { data: points = [] } = useQuery({
    queryKey: ["points-names"],
    queryFn: async () => (await supabase.from("collection_points").select("id,nombre").order("nombre")).data ?? [],
  });

  const lines = Object.entries(items).filter(([, v]) => v.n > 0).map(([id, v]) => {
    const m = materials.find((x) => x.id === id);
    if (!m) return null;
    const kgEach = Number(v.size === "pequeno" ? m.kg_pequeno : v.size === "grande" ? m.kg_grande : m.kg_mediano);
    const kg = kgEach * v.n;
    return { id, ...v, kg, co2: kg * Number(m.co2_por_kg) };
  });
  const validLines = lines.filter((l): l is NonNullable<typeof l> => l !== null);
  const kg = validLines.reduce((a, l) => a + l.kg, 0);
  const co2 = validLines.reduce((a, l) => a + l.co2, 0);
  const puntos = Math.min(500, Math.round(kg * 10) + validLines.length * 2);

  const change = (id: string, d: number) =>
    setItems((s) => ({ ...s, [id]: { size: s[id]?.size ?? "mediano", n: Math.max(0, (s[id]?.n ?? 0) + d) } }));

  async function save() {
    if (!validLines.length) { toast.error("Agrega al menos un material."); return; }
    const entry = {client:crypto.randomUUID(),user:user.id,point:pointId||null,items:validLines.map(l=>({id:l.id,n:l.n,size:l.size}))};
    if(!navigator.onLine){ enqueue(entry); toast.success("Guardado en este dispositivo. Se enviará cuando vuelva la señal."); setItems({}); return; }
    setBusy(true);
    try {
      const {error} = await supabase.rpc("record_recycling", {_client:entry.client,_point:entry.point as string,_items:entry.items});
      if(error) throw error;
      qc.invalidateQueries();
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) confetti({particleCount:65,spread:65});
      toast.success(`¡Bien! Sumaste ${puntos} puntos 🌱`);
      nav({to:"/perfil"});
    } catch(e) { toast.error(e instanceof Error ? e.message : "No se pudo guardar. Intenta nuevamente."); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-28">
      <Reci size={64} message="¿Qué reciclaste hoy? Recuerda: limpio y seco." />
      <select className="w-full rounded-xl border border-input bg-card p-3" value={pointId} onChange={(e) => setPointId(e.target.value)}>
        <option value="">Punto (opcional)</option>
        {points.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </select>
      <div className="space-y-2">
        {materials.map((m) => {
          const it = items[m.id];
          return (
            <div key={m.id} className="rounded-2xl bg-card p-3 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="h-3 w-3 rounded-full" style={{ background: m.color }} />{m.nombre}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="icon" aria-label={`Quitar ${m.nombre}`} className="rounded-full bg-secondary p-1" onClick={() => change(m.id, -1)}><Minus className="h-4 w-4" /></Button>
                  <span className="w-6 text-center">{it?.n ?? 0}</span>
                  <Button size="icon" aria-label={`Agregar ${m.nombre}`} className="rounded-full bg-primary p-1 text-primary-foreground" onClick={() => change(m.id, 1)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              {it && it.n > 0 && (
                <div className="mt-2 flex gap-1">
                  {(Object.keys(SIZE_LABEL) as Size[]).map((sz) => (
                    <Button variant="secondary" key={sz} onClick={() => setItems((s) => ({ ...s, [m.id]: { n: s[m.id]?.n ?? 0, size: sz } }))}
                      className={`flex-1 rounded-lg py-1 text-xs ${it.size === sz ? "bg-leaf text-primary-foreground" : "bg-secondary"}`}>
                      {SIZE_LABEL[sz]}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="sticky bottom-20 rounded-2xl bg-card p-4 shadow-float">
        <p className="text-sm">≈ {kg.toFixed(2)} kg · {co2.toFixed(2)} kg CO₂ evitado · <b>{puntos} pts</b></p>
        <Button className="mt-2 w-full" disabled={busy} onClick={save}>Guardar registro</Button>
      </div>
      <BottomNav />
    </div>
  );
}
