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
    setBusy(true);
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password: pass })
        : await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (mode === "up") toast.success("Revisa tu correo para confirmar tu cuenta.");
    else nav({ to: "/perfil" });
  }

  async function signInWithGoogle() {
    setGoogleBusy(true);
    setGoogleError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        const message = /unsupported provider|missing oauth secret|provider is not enabled/i.test(error.message)
          ? "Google todavía no está configurado en el servidor de autenticación. Puedes ingresar o crear tu cuenta con correo y contraseña mientras se habilita."
          : `No se pudo iniciar sesión con Google: ${error.message}`;
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
      <Button variant="outline" disabled={googleBusy} onClick={signInWithGoogle}>
        {googleBusy ? "Conectando con Google…" : "Continuar con Google"}
      </Button>
      {googleError && (
        <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p className="font-semibold">Google no está disponible por ahora</p>
          <p className="mt-1">{googleError}</p>
          <p className="mt-2">Usa el formulario de abajo para ingresar o crear una cuenta con correo y contraseña.</p>
        </div>
      )}
      <div className="text-center text-sm text-muted-foreground">o continúa con tu correo</div>
      <form onSubmit={submit} className="space-y-3">
        <Input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Contraseña" minLength={6} value={pass} onChange={(e) => setPass(e.target.value)} required />
        <Button className="w-full" disabled={busy}>{busy ? "Procesando…" : mode === "in" ? "Ingresar" : "Crear cuenta"}</Button>
      </form>
      <button className="text-sm text-muted-foreground underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setGoogleError(""); }}>
        {mode === "in" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
      </button>
    </div>
  );
}
