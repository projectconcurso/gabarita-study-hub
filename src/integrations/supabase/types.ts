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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      amizades: {
        Row: {
          amigo_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amigo_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amigo_id?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comentarios_mural: {
        Row: {
          comentario: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          comentario: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          comentario?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_mural_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_mural"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          created_at: string
          destinatario_id: string
          id: string
          lida: boolean | null
          mensagem: string
          remetente_id: string
        }
        Insert: {
          created_at?: string
          destinatario_id: string
          id?: string
          lida?: boolean | null
          mensagem: string
          remetente_id: string
        }
        Update: {
          created_at?: string
          destinatario_id?: string
          id?: string
          lida?: boolean | null
          mensagem?: string
          remetente_id?: string
        }
        Relationships: []
      }
      posts_mural: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          simulado_id: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          simulado_id?: string | null
          tipo?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          simulado_id?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_mural_simulado_id_fkey"
            columns: ["simulado_id"]
            isOneToOne: false
            referencedRelation: "simulados"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area_forte: string | null
          area_fraca: string | null
          cargo_desejado: string | null
          created_at: string
          data_prova: string | null
          foto_url: string | null
          id: string
          nome: string
          sobrenome: string
          updated_at: string
        }
        Insert: {
          area_forte?: string | null
          area_fraca?: string | null
          cargo_desejado?: string | null
          created_at?: string
          data_prova?: string | null
          foto_url?: string | null
          id: string
          nome: string
          sobrenome: string
          updated_at?: string
        }
        Update: {
          area_forte?: string | null
          area_fraca?: string | null
          cargo_desejado?: string | null
          created_at?: string
          data_prova?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          sobrenome?: string
          updated_at?: string
        }
        Relationships: []
      }
      questoes: {
        Row: {
          alternativas: Json
          created_at: string
          enunciado: string
          explicacao: string | null
          id: string
          ordem: number
          resposta_correta: string
          resposta_usuario: string | null
          simulado_id: string
        }
        Insert: {
          alternativas: Json
          created_at?: string
          enunciado: string
          explicacao?: string | null
          id?: string
          ordem: number
          resposta_correta: string
          resposta_usuario?: string | null
          simulado_id: string
        }
        Update: {
          alternativas?: Json
          created_at?: string
          enunciado?: string
          explicacao?: string | null
          id?: string
          ordem?: number
          resposta_correta?: string
          resposta_usuario?: string | null
          simulado_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questoes_simulado_id_fkey"
            columns: ["simulado_id"]
            isOneToOne: false
            referencedRelation: "simulados"
            referencedColumns: ["id"]
          },
        ]
      }
      reacoes_mural: {
        Row: {
          created_at: string
          id: string
          post_id: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reacoes_mural_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_mural"
            referencedColumns: ["id"]
          },
        ]
      }
      simulados: {
        Row: {
          acertos: number
          created_at: string
          finished_at: string | null
          id: string
          materia: string
          percentual_acerto: number | null
          status: string
          tema: string
          tempo_gasto: number | null
          titulo: string
          total_questoes: number
          user_id: string
        }
        Insert: {
          acertos?: number
          created_at?: string
          finished_at?: string | null
          id?: string
          materia: string
          percentual_acerto?: number | null
          status?: string
          tema: string
          tempo_gasto?: number | null
          titulo: string
          total_questoes: number
          user_id: string
        }
        Update: {
          acertos?: number
          created_at?: string
          finished_at?: string | null
          id?: string
          materia?: string
          percentual_acerto?: number | null
          status?: string
          tema?: string
          tempo_gasto?: number | null
          titulo?: string
          total_questoes?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
