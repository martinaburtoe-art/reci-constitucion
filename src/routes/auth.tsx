import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { APP_NAME } from "@/lib/app";
import { Reci } from "@/components/Reci";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Ingresar · ${APP_NAME}` },
      { name: "description", content: `Crea tu cuenta en ${APP_NAME} y registra tu reciclaje.` },
      { property: "og:title", content: `Ingresar · ${APP_NAME}` },
      { property: "og:description", content: "Registra tu reciclaje en Constitución." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function authErrorMessage(error: unknown, mode: "in" | "up"): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const message = raw.toLowerCase();

  if (/missing supabase environment|vite_supabase_url|supabase_publishable_key/.test(message)) {
    return "El servicio de acceso no está configurado en este despliegue. Contacta al administrador de ReciConti.";
  }
  if (/invalid login credentials|invalid email or password/.test(message)) {
    return "Correo o contraseña incorrectos.";
  }
  if (/email not confirmed/.test(message)) {
    return "Debes confirmar tu correo antes de ingresar.";
  }
  if (/user already registered/.test(message)) {
    return "Este correo ya tiene una cuenta. Cambia a Ingresar.";
  }
  if (/rate limit|too many requests/.test(message)) {
    return "Se realizaron demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
  }
  if (/failed to fetch|networkerror|fetch failed|network request failed/.test(message)) {
    return "No fue posible conectar con el servicio de acceso. Revisa tu conexión e inténtalo nuevamente.";
  }

  // No mostrar detalles internos del proveedor, URLs privadas ni información de configuración.
  return mode === "in"
    ? "No se pudo iniciar sesión. Comprueba tus datos e inténtalo nuevamente."
    : "No se pudo crear la cuenta. Revisa los datos e inténtalo nuevamente.";
}

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    try {
      const result =
        mode === "in"
          ? await supabase.auth.signInWithPassword({ email: email.trim(), password: pass })
          : await supabase.auth.signUp({
              email: email.trim(),
              password: pass,
              options: { emailRedirectTo: window.location.origin },
            });

      if (result.error) {
        toast.error(authErrorMessage(result.error, mode));
        return;
      }

      if (mode === "up") {
        toast.success("Revisa tu correo para confirmar tu cuenta.");
      } else {
        await nav({ to: "/perfil" });
      }
    } catch (error) {
      // Incluye fallos de inicialización por variables ausentes y errores de red.
      toast.error(authErrorMessage(error, mode));
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (googleBusy) return;
    setGoogleBusy(true);
    setGoogleError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        const message = /unsupported provider|missing oauth secret|provider is not enabled/i.test(error.message)
          ? "Google todavía no está configurado en el servicio de autenticación. Puedes ingresar o crear tu cuenta con correo y contraseña mientras se habilita."
          : "No se pudo iniciar sesión con Google. Inténtalo nuevamente o usa tu correo.";
        setGoogleError(message);
        toast.error(message);
      }
    } catch {
      const message = "No fue posible conectar con Google. Intenta con correo y contraseña.";
      setGoogleError(message);
      toast.error(message);
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-6 p-6">
      <Reci message={`¡Hola! Soy Reci. ${mode === "in" ? "Ingresa" : "Crea tu cuenta"} para sumar puntos reciclando.`} />
      <h1 className="font-display text-3xl font-bold text-leaf-dark">{APP_NAME}</h1>
      <Button variant="outline" disabled={googleBusy || busy} onClick={signInWithGoogle}>
        {googleBusy ? "Conectando con Google…" : "Continuar con Google"}
      </Button>
      {googleError && (
        <div role="alert" aria-live="polite" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p className="font-semibold">Google no está disponible por ahora</p>
          <p className="mt-1">{googleError}</p>
          <p className="mt-2">Usa el formulario de abajo para ingresar o crear una cuenta con correo y contraseña.</p>
        </div>
      )}
      <div className="text-center text-sm text-muted-foreground">o continúa con tu correo</div>
      <form onSubmit={submit} className="space-y-3">
        <Input type="email" autoComplete="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={busy} />
        <Input type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder="Contraseña" minLength={6} value={pass} onChange={(e) => setPass(e.target.value)} required disabled={busy} />
        <Button className="w-full" disabled={busy || googleBusy}>
          {busy ? "Procesando…" : mode === "in" ? "Ingresar" : "Crear cuenta"}
        </Button>
      </form>
      <button
        type="button"
        className="text-sm text-muted-foreground underline"
        disabled={busy || googleBusy}
        onClick={() => {
          setMode(mode === "in" ? "up" : "in");
          setGoogleError("");
        }}
      >
        {mode === "in" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
      </button>
    </div>
  );
}
