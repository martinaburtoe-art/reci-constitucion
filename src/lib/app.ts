export const APP_NAME = "ReciConti";
export const MAP_CENTER: [number, number] = [-35.3333, -72.4167];
export const MAP_ZOOM = 14;

export type PointLite = {
  id: string;
  nombre: string;
  direccion: string | null;
  lat: number;
  lng: number;
  horario: string | null;
  estado: "activo" | "lleno" | "cerrado";
  nivel_llenado: number;
  verificado: boolean;
  materiales: string[];
  fuente?: string | null;
  foto_url?: string | null;
  operador?: string | null;
  telefono?: string | null;
  dias_atencion?: string | null;
  dias_retiro?: string | null;
};

export const ESTADO_LABEL = { activo: "Activo", lleno: "Lleno", cerrado: "Cerrado" } as const;
