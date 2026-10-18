import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import { Button } from "@/components/ui/button";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { MAP_CENTER, MAP_ZOOM, type PointLite } from "@/lib/app";

const COLORS = { activo: "primary", lleno: "warning", cerrado: "muted-foreground" };

export default function PointsMap({
  points,
  onSelect,
}: {
  points: PointLite[];
  onSelect: (p: PointLite) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { zoomControl: false }).setView(MAP_CENTER, MAP_ZOOM);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map.current);
    layer.current = L.markerClusterGroup({iconCreateFunction: c => L.divIcon({html: String(c.getChildCount()),className:"reci-cluster",iconSize:[40,40]})}).addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const currentLayer = layer.current;
    if (!currentLayer) return;
    currentLayer.clearLayers();
    points.forEach((p) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="reci-pin ${p.verificado ? "" : "unverified"}" style="background:var(--${COLORS[p.estado]})"><span></span></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });
      L.marker([p.lat, p.lng], { icon }).on("click", () => onSelect(p)).addTo(currentLayer);
    });
  }, [points, onSelect]);

  return <><div ref={el} className="h-full w-full" /><Button variant="secondary" size="icon" className="absolute left-4 bottom-20 z-[1000] shadow-float" aria-label="Cerca de mí" onClick={() => { navigator.geolocation.getCurrentPosition(p => map.current?.setView([p.coords.latitude,p.coords.longitude],16), () => toast.error("Activa el permiso de ubicación."), {enableHighAccuracy:true}); }}><LocateFixed /></Button></>;
}
