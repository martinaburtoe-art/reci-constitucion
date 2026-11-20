import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Ruta estable para la sección "Reciclar".
 * El registro real sigue en /registrar, donde se valida la sesión del usuario.
 */
export const Route = createFileRoute("/reciclar")({
  beforeLoad: () => {
    throw redirect({ to: "/registrar" });
  },
  component: () => null,
});
