import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Estamos verificando tu sesión de forma segura…");

  useEffect(() => {
    let active = true;

    async function completeSignIn() {
      const params = new URLSearchParams(window.location.search);
      const authError = params.get("error_description") || params.get("error");

      if (authError) {
        if (active) {
          setMessage("Google no pudo completar el acceso. Vuelve a ingresar e inténtalo nuevamente.");
        }
        return;
      }

      try {
        // Supabase procesa el código OAuth al inicializar el cliente.
        // getSession espera esa inicialización antes de consultar la sesión.
        const { data, error } = await supabase.auth.getSession();

        if (!active) return;

        if (error || !data.session) {
          setMessage("No pudimos confirmar tu sesión. Vuelve a ingresar e inténtalo nuevamente.");
          return;
        }

        await navigate({ to: "/perfil", replace: true });
      } catch {
        if (active) {
          setMessage("No pudimos completar el acceso. Vuelve a ingresar e inténtalo nuevamente.");
        }
      }
    }

    void completeSignIn();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <div aria-live="polite" role="status" className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-leaf-dark">ReciConti</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button asChild variant="outline">
        <Link to="/auth">Volver al inicio de sesión</Link>
      </Button>
    </main>
  );
}
