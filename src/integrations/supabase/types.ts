export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          descripcion: string
          icono: string
          id: string
          nombre: string
          regla: string
          umbral: number
        }
        Insert: {
          descripcion: string
          icono: string
          id: string
          nombre: string
          regla: string
          umbral: number
        }
        Update: {
          descripcion?: string
          icono?: string
          id?: string
          nombre?: string
          regla?: string
          umbral?: number
        }
        Relationships: []
      }
      collection_points: {
        Row: {
          admin_id: string | null
          created_at: string
          dias_atencion: string | null
          dias_retiro: string | null
          direccion: string | null
          estado: Database["public"]["Enums"]["point_status"]
          foto_url: string | null
          fuente: string | null
          horario: string | null
          id: string
          lat: number
          lng: number
          nivel_llenado: number
          nombre: string
          operador: string | null
          propuesta_at: string | null
          propuesta_lat: number | null
          propuesta_lng: number | null
          propuesta_por: string | null
          telefono: string | null
          updated_at: string
          verificado: boolean
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          dias_atencion?: string | null
          dias_retiro?: string | null
          direccion?: string | null
          estado?: Database["public"]["Enums"]["point_status"]
          foto_url?: string | null
          fuente?: string | null
          horario?: string | null
          id?: string
          lat: number
          lng: number
          nivel_llenado?: number
          nombre: string
          operador?: string | null
          propuesta_at?: string | null
          propuesta_lat?: number | null
          propuesta_lng?: number | null
          propuesta_por?: string | null
          telefono?: string | null
          updated_at?: string
          verificado?: boolean
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          dias_atencion?: string | null
          dias_retiro?: string | null
          direccion?: string | null
          estado?: Database["public"]["Enums"]["point_status"]
          foto_url?: string | null
          fuente?: string | null
          horario?: string | null
          id?: string
          lat?: number
          lng?: number
          nivel_llenado?: number
          nombre?: string
          operador?: string | null
          propuesta_at?: string | null
          propuesta_lat?: number | null
          propuesta_lng?: number | null
          propuesta_por?: string | null
          telefono?: string | null
          updated_at?: string
          verificado?: boolean
        }
        Relationships: []
      }
      material_goals: {
        Row: {
          kg: number
          material_id: string
          user_id: string
        }
        Insert: {
          kg?: number
          material_id: string
          user_id: string
        }
        Update: {
          kg?: number
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_goals_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          co2_por_kg: number
          color: string
          icono: string
          id: string
          kg_grande: number
          kg_mediano: number
          kg_pequeno: number
          no_acepta: string[]
          nombre: string
          orden: number
          preparacion: string[]
          unidad: string
        }
        Insert: {
          co2_por_kg?: number
          color: string
          icono: string
          id: string
          kg_grande?: number
          kg_mediano?: number
          kg_pequeno?: number
          no_acepta?: string[]
          nombre: string
          orden?: number
          preparacion?: string[]
          unidad?: string
        }
        Update: {
          co2_por_kg?: number
          color?: string
          icono?: string
          id?: string
          kg_grande?: number
          kg_mediano?: number
          kg_pequeno?: number
          no_acepta?: string[]
          nombre?: string
          orden?: number
          preparacion?: string[]
          unidad?: string
        }
        Relationships: []
      }
      point_materials: {
        Row: {
          material_id: string
          point_id: string
        }
        Insert: {
          material_id: string
          point_id: string
        }
        Update: {
          material_id?: string
          point_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_materials_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "collection_points"
            referencedColumns: ["id"]
          },
        ]
      }
      point_suggestions: {
        Row: {
          created_at: string
          estado: string
          horario: string | null
          id: string
          lat: number | null
          lng: number | null
          materiales: string[] | null
          nota: string
          point_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: string
          horario?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          materiales?: string[] | null
          nota?: string
          point_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: string
          horario?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          materiales?: string[] | null
          nota?: string
          point_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_suggestions_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "collection_points"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          monthly_goal_kg: number
          onboarding_done: boolean
          points: number
          public_alias: string | null
          ranking_opt_in: boolean
          sector: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          monthly_goal_kg?: number
          onboarding_done?: boolean
          points?: number
          public_alias?: string | null
          ranking_opt_in?: boolean
          sector?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          monthly_goal_kg?: number
          onboarding_done?: boolean
          points?: number
          public_alias?: string | null
          ranking_opt_in?: boolean
          sector?: string | null
        }
        Relationships: []
      }
      recycling_log_items: {
        Row: {
          cantidad: number
          id: string
          kg: number
          log_id: string
          material_id: string
          tamano: string
        }
        Insert: {
          cantidad?: number
          id?: string
          kg?: number
          log_id: string
          material_id: string
          tamano?: string
        }
        Update: {
          cantidad?: number
          id?: string
          kg?: number
          log_id?: string
          material_id?: string
          tamano?: string
        }
        Relationships: [
          {
            foreignKeyName: "recycling_log_items_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "recycling_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recycling_log_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      recycling_logs: {
        Row: {
          client_id: string | null
          co2_total: number
          created_at: string
          foto_url: string | null
          id: string
          kg_total: number
          point_id: string | null
          puntos: number
          user_id: string
        }
        Insert: {
          client_id?: string | null
          co2_total?: number
          created_at?: string
          foto_url?: string | null
          id?: string
          kg_total?: number
          point_id?: string | null
          puntos?: number
          user_id: string
        }
        Update: {
          client_id?: string | null
          co2_total?: number
          created_at?: string
          foto_url?: string | null
          id?: string
          kg_total?: number
          point_id?: string | null
          puntos?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recycling_logs_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "collection_points"
            referencedColumns: ["id"]
          },
        ]
      }
      report_photos: {
        Row: {
          created_at: string
          id: string
          path: string
          report_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          report_id: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_photos_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          codigo: string
          consentimiento: boolean
          created_at: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["report_status"]
          historial: Json
          id: string
          lat: number | null
          lng: number | null
          point_id: string | null
          publico: boolean
          tipo: Database["public"]["Enums"]["report_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          codigo?: string
          consentimiento?: boolean
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["report_status"]
          historial?: Json
          id?: string
          lat?: number | null
          lng?: number | null
          point_id?: string | null
          publico?: boolean
          tipo: Database["public"]["Enums"]["report_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          codigo?: string
          consentimiento?: boolean
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["report_status"]
          historial?: Json
          id?: string
          lat?: number | null
          lng?: number | null
          point_id?: string | null
          publico?: boolean
          tipo?: Database["public"]["Enums"]["report_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "collection_points"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          descripcion: string | null
          dia_semana: number | null
          fecha: string | null
          hora: string | null
          id: string
          referencial: boolean
          sector: string
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          dia_semana?: number | null
          fecha?: string | null
          hora?: string | null
          id?: string
          referencial?: boolean
          sector: string
          tipo?: string
          titulo: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          dia_semana?: number | null
          fecha?: string | null
          hora?: string | null
          id?: string
          referencial?: boolean
          sector?: string
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      community_ranking: {
        Args: { _sector?: string }
        Returns: {
          alias: string
          kg: number
          sector: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      propose_location: {
        Args: { _lat: number; _lng: number; _point: string }
        Returns: undefined
      }
      record_recycling: {
        Args: { _client: string; _items: Json; _point: string }
        Returns: string
      }
      report_fill_level: {
        Args: { _level: number; _point: string }
        Returns: undefined
      }
      review_suggestion: {
        Args: { _approve: boolean; _id: string }
        Returns: undefined
      }
      track_report: {
        Args: { _codigo: string }
        Returns: {
          codigo: string
          created_at: string
          estado: Database["public"]["Enums"]["report_status"]
          historial: Json
          tipo: Database["public"]["Enums"]["report_type"]
        }[]
      }
    }
    Enums: {
      app_role: "usuario" | "admin_punto" | "super_admin"
      point_status: "activo" | "lleno" | "cerrado"
      report_status: "recibido" | "en_revision" | "resuelto" | "rechazado"
      report_type:
        | "punto_lleno"
        | "vandalismo"
        | "basura_suelo"
        | "microbasural"
        | "contenedor_danado"
        | "info_incorrecta"
        | "otro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["usuario", "admin_punto", "super_admin"],
      point_status: ["activo", "lleno", "cerrado"],
      report_status: ["recibido", "en_revision", "resuelto", "rechazado"],
      report_type: [
        "punto_lleno",
        "vandalismo",
        "basura_suelo",
        "microbasural",
        "contenedor_danado",
        "info_incorrecta",
        "otro",
      ],
    },
  },
} as const
