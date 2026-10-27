import { Link } from "@tanstack/react-router";
import { Map, PlusCircle, User, CalendarDays, Flag, Settings } from "lucide-react";

const items = [
  { to: "/", label: "Mapa", Icon: Map },
  { to: "/reciclar", label: "Reciclar", Icon: PlusCircle },
  { to: "/calendario", label: "Calendario", Icon: CalendarDays },
  { to: "/denunciar", label: "Denunciar", Icon: Flag },
  { to: "/perfil", label: "Perfil", Icon: User },
  { to: "/configuracion", label: "Ajustes", Icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md justify-around">
        {items.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground sm:text-xs"
            activeProps={{ className: "text-primary font-semibold" }}
            activeOptions={{ exact: true }}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
