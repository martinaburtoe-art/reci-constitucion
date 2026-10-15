import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password: pass })
        : await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "up") toast.success("Revisa tu correo para confirmar tu cuenta.");
    else nav({ to: "/perfil" });
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-6 p-6">
      <Reci message={`¡Hola! Soy Reci. ${mode === "in" ? "Ingresa" : "Crea tu cuenta"} para sumar puntos reciclando.`} />
      <h1 className="font-display text-3xl font-bold text-leaf-dark">{APP_NAME}</h1>
      <Button variant="outline" onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}>
        Continuar con Google
      </Button>
      <form onSubmit={submit} className="space-y-3">
        <Input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Contraseña" minLength={6} value={pass} onChange={(e) => setPass(e.target.value)} required />
        <Button className="w-full" disabled={busy}>{mode === "in" ? "Ingresar" : "Crear cuenta"}</Button>
      </form>
      <button className="text-sm text-muted-foreground underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
      </button>
    </div>
  );
}
