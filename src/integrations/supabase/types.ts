export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          sobrenome: string;
          foto_url: string | null;
          escolaridade: string | null;
          curso: string | null;
          data_nascimento: string | null;
          cidade: string | null;
          estado: string | null;
          area_forte: string | null;
          area_fraca: string | null;
          cargo_desejado: string | null;
          created_at: string;
          updated_at: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          trial_ends_at: string | null;
          subscription_started_at: string | null;
        };
        Insert: {
          id: string;
          nome?: string;
          sobrenome?: string;
          foto_url?: string | null;
          escolaridade?: string | null;
          curso?: string | null;
          data_nascimento?: string | null;
          cidade?: string | null;
          estado?: string | null;
          area_forte?: string | null;
          area_fraca?: string | null;
          cargo_desejado?: string | null;
          created_at?: string;
          updated_at?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          trial_ends_at?: string | null;
          subscription_started_at?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          sobrenome?: string;
          foto_url?: string | null;
          escolaridade?: string | null;
          curso?: string | null;
          data_nascimento?: string | null;
          cidade?: string | null;
          estado?: string | null;
          area_forte?: string | null;
          area_fraca?: string | null;
          cargo_desejado?: string | null;
          created_at?: string;
          updated_at?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          trial_ends_at?: string | null;
          subscription_started_at?: string | null;
        };
      };
      simulados: {
        Row: {
          id: string;
          user_id: string;
          titulo: string;
          tema: string;
          materia: string;
          total_questoes: number;
          acertos: number;
          status: string;
          percentual_acerto: number | null;
          created_at: string;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          titulo: string;
          tema: string;
          materia: string;
          total_questoes: number;
          acertos?: number;
          status?: string;
          percentual_acerto?: number | null;
          created_at?: string;
          finished_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          titulo?: string;
          tema?: string;
          materia?: string;
          total_questoes?: number;
          acertos?: number;
          status?: string;
          percentual_acerto?: number | null;
          created_at?: string;
          finished_at?: string | null;
        };
      };
      questoes: {
        Row: {
          id: string;
          simulado_id: string;
          enunciado: string;
          alternativas: Json;
          resposta_correta: string;
          explicacao: string | null;
          resposta_usuario: string | null;
          ordem: number;
        };
        Insert: {
          id?: string;
          simulado_id: string;
          enunciado: string;
          alternativas: Json;
          resposta_correta: string;
          explicacao?: string | null;
          resposta_usuario?: string | null;
          ordem: number;
        };
        Update: {
          id?: string;
          simulado_id?: string;
          enunciado?: string;
          alternativas?: Json;
          resposta_correta?: string;
          explicacao?: string | null;
          resposta_usuario?: string | null;
          ordem?: number;
        };
      };
      amizades: {
        Row: {
          id: string;
          user_id: string;
          amigo_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amigo_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amigo_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      mensagens: {
        Row: {
          id: string;
          remetente_id: string;
          destinatario_id: string;
          mensagem: string;
          lida: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          remetente_id: string;
          destinatario_id: string;
          mensagem: string;
          lida?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          remetente_id?: string;
          destinatario_id?: string;
          mensagem?: string;
          lida?: boolean;
          created_at?: string;
        };
      };
      posts_mural: {
        Row: {
          id: string;
          user_id: string;
          conteudo: string;
          tipo: string;
          simulado_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conteudo: string;
          tipo: string;
          simulado_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conteudo?: string;
          tipo?: string;
          simulado_id?: string | null;
          created_at?: string;
        };
      };
      reacoes_mural: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          tipo: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          tipo: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          tipo?: string;
          created_at?: string;
        };
      };
      comentarios_mural: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          conteudo: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          conteudo: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          conteudo?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
