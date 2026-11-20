import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Page } from '@/components/Page';
import { Reci } from '@/components/Reci';
import { pageHead } from '@/lib/features';

type PublicImpact = { total_kg: number | string; total_co2: number | string; total_registros: number; puntos_activos: number };
const metricsClient = supabase as unknown as { rpc: (name: string) => Promise<{ data: PublicImpact[] | null; error: { message: string } | null }> };

export const Route = createFileRoute('/impacto')({
  head: () => pageHead('Acerca de e impacto', 'Impacto comunitario de reciclaje en Constitución, Maule, con métricas agregadas.'),
  component: Impact,
});

function Impact() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-impact-metrics'],
    queryFn: async () => {
      const { data, error } = await metricsClient.rpc('public_impact_metrics');
      if (error) throw error;
      return data?.[0] ?? null;
    },
    staleTime: 60_000,
  });
  const kg = data ? Number(data.total_kg) : null;
  const co2 = data ? Number(data.total_co2) : null;

  return <Page title="ReciConti">
    <Reci size={96} message="Reciclar en Constitución empieza con información confiable." />
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Impacto de toda la comuna</h2>
      <p>Estas cifras agregan los registros de reciclaje de la comunidad; no muestran nombres, correos ni perfiles individuales.</p>
      {isLoading ? <p role="status" className="text-sm text-muted-foreground">Cargando métricas comunitarias…</p>
        : isError || !data ? <p role="status" className="rounded-xl border p-4 text-sm text-muted-foreground">Las métricas públicas todavía no están disponibles. Vuelve a intentarlo más tarde.</p>
        : <div className="grid grid-cols-2 gap-3">
          <Metric label="Kg reciclados registrados" value={kg!.toLocaleString('es-CL', { maximumFractionDigits: 1 })} />
          <Metric label="CO₂ estimado (kg)" value={co2!.toLocaleString('es-CL', { maximumFractionDigits: 1 })} />
          <Metric label="Registros comunitarios" value={Number(data.total_registros).toLocaleString('es-CL')} />
          <Metric label="Puntos activos" value={Number(data.puntos_activos).toLocaleString('es-CL')} />
        </div>}
      <p className="text-xs text-muted-foreground">Cifras calculadas a partir de registros guardados. El CO₂ es una estimación basada en factores configurables, no una certificación ambiental.</p>
    </section>
    <section className="space-y-3 border-t pt-5"><h2 className="text-2xl font-bold">Una comuna, muchos pequeños cambios</h2><p>ReciConti conecta a vecinos con puntos de reciclaje de Constitución, Región del Maule. La información de ubicación, horarios y materiales debe provenir de fuentes oficiales o revisiones en terreno.</p></section>
    <section className="space-y-3 border-t pt-5"><h2 className="text-2xl font-bold">Ley REP</h2><p>La Ley 20.920 establece la responsabilidad extendida del productor y fomenta la prevención y valorización de residuos. Productores de productos prioritarios deben organizar y financiar la gestión de sus residuos según las metas aplicables.</p><a className="text-primary underline" href="https://economiacircular.mma.gob.cl/ley-rep/" target="_blank" rel="noreferrer">Información oficial del Ministerio del Medio Ambiente</a></section>
    <section className="space-y-3 border-t pt-5"><h2 className="text-2xl font-bold">La brecha local</h2><p>Encontrar un punto no basta: también importa saber qué recibe, cuándo atiende y si tiene capacidad. ReciConti reúne esa información con propuestas vecinales revisadas.</p><p className="text-sm text-muted-foreground">Este análisis es cualitativo, no una encuesta ni un estudio con cifras de mercado verificadas.</p></section>
    <section className="space-y-3 border-t pt-5"><h2 className="text-2xl font-bold">Impacto transparente</h2><p>Los kilos se estiman según cantidad, tamaño y material. El CO₂ se calcula con factores referenciales editables; no representa una certificación ambiental.</p><p>Los puntos sin verificar dicen “Ubicación por confirmar”. Nunca confirmes un lugar sin revisar su fuente.</p></section>
    <Link to="/ranking" className="block text-primary underline">Ver el impacto compartido por vecinos</Link>
  </Page>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border bg-card p-4"><p className="font-display text-2xl font-bold text-leaf-dark">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>;
}