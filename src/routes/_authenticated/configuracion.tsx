import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Settings2, UserRound, MapPinned, Recycle, CalendarDays, Flag, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Page";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/features";

export const Route = createFileRoute("/_authenticated/configuracion")({
  head: () => pageHead("Configuración", "Preferencias y administración interna de ReciConti."),
  component: Configuracion,
});

function Configuracion() {
  const { user } = Route.useRouteContext();
  const { data: roles = [], isLoading, isError } = useQuery({
    queryKey: ["settings-roles", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
  });
  const isAdmin = roles.some((item) => item.role === "super_admin" || item.role === "admin_punto");
  const isSuperAdmin = roles.some((item) => item.role === "super_admin");

  return (
    <Page title="Configuración">
      <div className="mx-auto max-w-2xl space-y-5 pb-24">
        <section className="rounded-2xl border bg-card p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Tu cuenta</h2>
              <p className="text-sm text-muted-foreground">Sesión iniciada como {user.email ?? "usuario de ReciConti"}.</p>
            </div>
          </div>
          <Link to="/perfil" className="inline-flex text-sm font-semibold text-primary underline underline-offset-4">
            Ver mi perfil
          </Link>
        </section>

        <section className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Administración interna</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona el contenido y los datos operativos de ReciConti desde un panel protegido por permisos.
                El acceso se valida con tu sesión y el rol guardado en la base de datos; no basta con conocer la URL.
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Verificando tus permisos…</p>
          ) : isError ? (
            <p role="alert" className="text-sm text-destructive">
              No pudimos verificar tus permisos. Recarga esta página o vuelve a intentarlo.
            </p>
          ) : isAdmin ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-secondary p-3">
                <p className="font-medium">{isSuperAdmin ? "Superadministrador" : "Administrador de puntos"}</p>
                <p className="text-sm text-muted-foreground">
                  {isSuperAdmin
                    ? "Puedes administrar catastro, materiales, calendario, denuncias, propuestas, métricas y permisos de usuarios."
                    : "Puedes gestionar las áreas operativas habilitadas para tu rol."}
                </p>
              </div>
              <Button asChild className="w-full">
                <Link to="/admin">Ingresar al panel de administración</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Tu cuenta aún no tiene permisos de administración.</p>
              <p className="text-sm text-muted-foreground">
                Por seguridad, la administración no se activa desde el navegador. Un superadministrador debe asignar el rol correspondiente.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin">Comprobar acceso administrativo</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold">Áreas que puede gestionar el administrador</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Feature icon={<MapPinned className="h-5 w-5" />} title="Puntos limpios" description="Crear, corregir y revisar ubicaciones del catastro." />
            <Feature icon={<Recycle className="h-5 w-5" />} title="Materiales" description="Mantener la información de reciclaje y preparación." />
            <Feature icon={<CalendarDays className="h-5 w-5" />} title="Calendario" description="Administrar eventos y horarios por sector." />
            <Feature icon={<Flag className="h-5 w-5" />} title="Propuestas y denuncias" description="Revisar aportes de la comunidad y actualizar su estado." />
            {isSuperAdmin && <Feature icon={<Users className="h-5 w-5" />} title="Usuarios y roles" description="Gestionar los permisos administrativos de las cuentas." />}
            <Feature icon={<UserRound className="h-5 w-5" />} title="Métricas" description="Consultar los indicadores de actividad e impacto." />
          </div>
        </section>
      </div>
    </Page>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-secondary/60 p-3">
      <span className="mt-0.5 text-primary" aria-hidden="true">{icon}</span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
