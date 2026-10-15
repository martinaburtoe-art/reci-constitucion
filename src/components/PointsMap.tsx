import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CENTER, MAP_ZOOM, type PointLite } from "@/lib/app";

const COLORS = { activo: "#2E9D6A", lleno: "#E3A21A", cerrado: "#8C9AA6" };

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
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    points.forEach((p) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${COLORS[p.estado]};border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.25)"></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });
      L.marker([p.lat, p.lng], { icon }).on("click", () => onSelect(p)).addTo(layer.current!);
    });
  }, [points, onSelect]);

  return <div ref={el} className="h-full w-full" />;
}
