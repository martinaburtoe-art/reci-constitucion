import { Link } from "@tanstack/react-router";
import { Map, PlusCircle, User, CalendarDays, Flag } from "lucide-react";

const items = [
  { to: "/", label: "Mapa", Icon: Map },
  { to: "/reciclar", label: "Reciclar", Icon: PlusCircle },
  { to: "/calendario", label: "Calendario", Icon: CalendarDays },
  { to: "/denunciar", label: "Denunciar", Icon: Flag },
  { to: "/perfil", label: "Perfil", Icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md justify-around">
        {items.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground"
            activeProps={{ className: "text-primary font-semibold" }}
            activeOptions={{ exact: true }}
          >
            <Icon className="h-6 w-6" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
