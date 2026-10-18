import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { APP_NAME } from "@/lib/app";
import { BottomNav } from "@/components/BottomNav";
import { Reci } from "@/components/Reci";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileExtras } from "@/components/ProfileExtras";
import { pageHead } from "@/lib/features";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => pageHead("Mi perfil", "Metas, rachas, insignias e impacto de reciclaje en ReciConti."),
  component: Perfil,
});

const SECTORES = ["Centro", "Santa Ana", "Mutrún", "Cerro O'Higgins", "Villa Verde", "Putú", "Otro"];

function Perfil() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user.id).single()).data,
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["logs", user.id],
    queryFn: async () =>
      (await supabase.from("recycling_logs").select("id,kg_total,co2_total,puntos,created_at").eq("user_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });

  if (!profile) return <div className="p-5"><p>Cargando tu perfil…</p><BottomNav /></div>;
  if (!profile.onboarding_done) return <Onboarding id={user.id} name={profile.display_name ?? ""} onDone={() => qc.invalidateQueries()} />;

  const month = new Date().toISOString().slice(0, 7);
  const kgMes = logs.filter((l) => l.created_at.startsWith(month)).reduce((a, l) => a + Number(l.kg_total), 0);
  const kgTotal = logs.reduce((a, l) => a + Number(l.kg_total), 0);
  const co2 = logs.reduce((a, l) => a + Number(l.co2_total), 0);
  const meta = Number(profile.monthly_goal_kg);

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-24">
      <Reci size={64} message={`¡Hola, ${profile.display_name}! Llevas ${kgMes.toFixed(1)} de ${meta} kg este mes.`} />
      <div className="rounded-2xl bg-card p-4 shadow-soft">
        <p className="text-sm text-muted-foreground">Meta mensual</p>
        <Progress value={Math.min(100, (kgMes / meta) * 100)} className="mt-2" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Puntos" value={profile.points} />
        <Stat label="kg total" value={kgTotal.toFixed(1)} />
        <Stat label="kg CO₂" value={co2.toFixed(1)} />
      </div>
      <ProfileExtras user={user.id} alias={profile.display_name ?? "Vecino/a"} logs={logs} />
      <h2 className="font-display text-xl font-bold">Historial</h2>
      {logs.length === 0 ? (
        <Link to="/registrar" search={{ punto: undefined }} className="block rounded-2xl bg-secondary p-4 text-center text-sm">Aún no registras nada. ¡Parte ahora!</Link>
      ) : logs.map((l) => (
        <div key={l.id} className="flex justify-between rounded-xl bg-card p-3 text-sm shadow-soft">
          <span>{new Date(l.created_at).toLocaleDateString("es-CL")}</span>
          <span>{Number(l.kg_total).toFixed(2)} kg · +{l.puntos} pts</span>
        </div>
      ))}
      <Button variant="ghost" className="w-full" onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}>Cerrar sesión</Button>
      <BottomNav />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-soft">
      <p className="font-display text-2xl font-bold text-leaf-dark">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Onboarding({ id, name, onDone }: { id: string; name: string; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [nombre, setNombre] = useState(name);
  const [sector, setSector] = useState("");
  const [meta, setMeta] = useState(5);
  const steps = [
    { msg: "¡Hola! Soy Reci 🌱. Te ayudo a reciclar en Constitución. ¿Cómo te llamas?", body: <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" /> },
    { msg: `Buena, ${nombre || "vecino/a"}. ¿En qué sector vives?`, body: (
      <div className="grid grid-cols-2 gap-2">{SECTORES.map((s) => (
        <Button variant="secondary" key={s} onClick={() => setSector(s)} className={`rounded-xl p-2 text-sm ${sector === s ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{s}</Button>
      ))}</div>
    ) },
    { msg: "Los puntos por confirmar necesitan una revisión en terreno. Nunca asumas que una ubicación es oficial.", body: <p className="text-sm text-muted-foreground">Puedes enviar tu GPS desde la ficha del punto. La administración revisará la propuesta.</p> },
    { msg: "Limpio, seco y separado: cada material tiene su preparación.", body: <p className="text-sm text-muted-foreground">Mantén fuera pilas, aceite y aparatos electrónicos de los contenedores de envases.</p> },
    { msg: "¿Cuántos kilos quieres reciclar al mes?", body: (
      <div className="flex items-center gap-3">
        <input type="range" min={1} max={30} value={meta} onChange={(e) => setMeta(+e.target.value)} className="flex-1" />
        <b>{meta} kg</b>
      </div>
    ) },
  ];
  async function next() {
    if (step < steps.length - 1) return setStep(step + 1);
    const { error } = await supabase.from("profiles").update({ display_name: nombre, sector, monthly_goal_kg: meta, onboarding_done: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    onDone();
  }
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-6 p-6">
      <Reci key={step} message={steps[step]?.msg} />
      {steps[step]?.body}
      <Button onClick={next}>{step < steps.length - 1 ? "Siguiente" : "¡Empezar!"}</Button>
    </div>
  );
}
