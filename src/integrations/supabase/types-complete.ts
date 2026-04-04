// Tipos completos gerados a partir do schema do banco de dados
// Gerado em: 2026-04-02

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      amizades: {
        Row: {
          id: string
          user_id: string
          amigo_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amigo_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amigo_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      apostilas: {
        Row: {
          id: string
          assunto_id: string
          conteudo: string
          status: string
          custo_gabaritos: number
          created_at: string
        }
        Insert: {
          id?: string
          assunto_id: string
          conteudo: string
          status?: string
          custo_gabaritos?: number
          created_at?: string
        }
        Update: {
          id?: string
          assunto_id?: string
          conteudo?: string
          status?: string
          custo_gabaritos?: number
          created_at?: string
        }
      }
      assuntos_materia: {
        Row: {
          id: string
          materia_id: string
          nome: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          materia_id: string
          nome: string
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          materia_id?: string
          nome?: string
          ordem?: number
          created_at?: string
        }
      }
      comentarios_mural: {
        Row: {
          id: string
          post_id: string
          user_id: string
          conteudo: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          conteudo: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          conteudo?: string
          created_at?: string
        }
      }
      concursos: {
        Row: {
          id: string
          user_id: string
          nome: string
          data_prova: string | null
          descricao: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          data_prova?: string | null
          descricao?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          data_prova?: string | null
          descricao?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      gabaritos_packages: {
        Row: {
          id: string
          name: string
          amount: number
          price_brl: number
          active: boolean
          created_at: string
          stripe_product_id: string | null
          stripe_price_id: string | null
        }
        Insert: {
          id?: string
          name: string
          amount: number
          price_brl: number
          active?: boolean
          created_at?: string
          stripe_product_id?: string | null
          stripe_price_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          amount?: number
          price_brl?: number
          active?: boolean
          created_at?: string
          stripe_product_id?: string | null
          stripe_price_id?: string | null
        }
      }
      gabaritos_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          simulado_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          simulado_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          simulado_id?: string | null
          created_at?: string
        }
      }
      materias_concurso: {
        Row: {
          id: string
          concurso_id: string
          nome: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          concurso_id: string
          nome: string
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          concurso_id?: string
          nome?: string
          ordem?: number
          created_at?: string
        }
      }
      mensagens: {
        Row: {
          id: string
          remetente_id: string
          destinatario_id: string
          mensagem: string
          lida: boolean
          created_at: string
        }
        Insert: {
          id?: string
          remetente_id: string
          destinatario_id: string
          mensagem: string
          lida?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          remetente_id?: string
          destinatario_id?: string
          mensagem?: string
          lida?: boolean
          created_at?: string
        }
      }
      posts_mural: {
        Row: {
          id: string
          user_id: string
          simulado_id: string | null
          conteudo: string
          tipo: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          simulado_id?: string | null
          conteudo: string
          tipo?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          simulado_id?: string | null
          conteudo?: string
          tipo?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          nome: string
          sobrenome: string
          foto_url: string | null
          cargo_desejado: string | null
          area_forte: string | null
          area_fraca: string | null
          created_at: string
          updated_at: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          subscription_started_at: string | null
          escolaridade: string | null
          curso: string | null
          data_nascimento: string | null
          cidade: string | null
          estado: string | null
        }
        Insert: {
          id: string
          nome: string
          sobrenome: string
          foto_url?: string | null
          cargo_desejado?: string | null
          area_forte?: string | null
          area_fraca?: string | null
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          subscription_started_at?: string | null
          escolaridade?: string | null
          curso?: string | null
          data_nascimento?: string | null
          cidade?: string | null
          estado?: string | null
        }
        Update: {
          id?: string
          nome?: string
          sobrenome?: string
          foto_url?: string | null
          cargo_desejado?: string | null
          area_forte?: string | null
          area_fraca?: string | null
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          subscription_started_at?: string | null
          escolaridade?: string | null
          curso?: string | null
          data_nascimento?: string | null
          cidade?: string | null
          estado?: string | null
        }
      }
      progresso_estudos: {
        Row: {
          id: string
          user_id: string
          assunto_id: string
          apostila_lida: boolean
          data_leitura_apostila: string | null
          simulados_concluidos: number
          tempo_estudo_segundos: number
          percentual_conclusao: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assunto_id: string
          apostila_lida?: boolean
          data_leitura_apostila?: string | null
          simulados_concluidos?: number
          tempo_estudo_segundos?: number
          percentual_conclusao?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assunto_id?: string
          apostila_lida?: boolean
          data_leitura_apostila?: string | null
          simulados_concluidos?: number
          tempo_estudo_segundos?: number
          percentual_conclusao?: number
          created_at?: string
          updated_at?: string
        }
      }
      questoes: {
        Row: {
          id: string
          simulado_id: string
          enunciado: string
          alternativas: Json
          resposta_correta: string
          resposta_usuario: string | null
          explicacao: string | null
          ordem: number
          created_at: string
          image_url: string | null
        }
        Insert: {
          id?: string
          simulado_id: string
          enunciado: string
          alternativas: Json
          resposta_correta: string
          resposta_usuario?: string | null
          explicacao?: string | null
          ordem: number
          created_at?: string
          image_url?: string | null
        }
        Update: {
          id?: string
          simulado_id?: string
          enunciado?: string
          alternativas?: Json
          resposta_correta?: string
          resposta_usuario?: string | null
          explicacao?: string | null
          ordem?: number
          created_at?: string
          image_url?: string | null
        }
      }
      reacoes_mural: {
        Row: {
          id: string
          post_id: string
          user_id: string
          tipo: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          tipo: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          tipo?: string
          created_at?: string
        }
      }
      sessoes_estudo: {
        Row: {
          id: string
          user_id: string
          assunto_id: string
          inicio: string
          fim: string | null
          duracao_segundos: number | null
          created_at: string
          tipo: string
        }
        Insert: {
          id?: string
          user_id: string
          assunto_id: string
          inicio: string
          fim?: string | null
          duracao_segundos?: number | null
          created_at?: string
          tipo?: string
        }
        Update: {
          id?: string
          user_id?: string
          assunto_id?: string
          inicio?: string
          fim?: string | null
          duracao_segundos?: number | null
          created_at?: string
          tipo?: string
        }
      }
      simulados: {
        Row: {
          id: string
          user_id: string
          titulo: string
          tema: string
          materia: string
          total_questoes: number
          acertos: number
          tempo_gasto: number | null
          percentual_acerto: number | null
          status: string
          created_at: string
          finished_at: string | null
          assunto_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          tema: string
          materia: string
          total_questoes: number
          acertos?: number
          tempo_gasto?: number | null
          percentual_acerto?: number | null
          status?: string
          created_at?: string
          finished_at?: string | null
          assunto_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          tema?: string
          materia?: string
          total_questoes?: number
          acertos?: number
          tempo_gasto?: number | null
          percentual_acerto?: number | null
          status?: string
          created_at?: string
          finished_at?: string | null
          assunto_id?: string | null
        }
      }
      slide_paginas: {
        Row: {
          id: string
          slide_id: string
          ordem: number
          tipo: string
          titulo: string
          subtitulo: string | null
          conteudo: Json
          presenter_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slide_id: string
          ordem: number
          tipo: string
          titulo: string
          subtitulo?: string | null
          conteudo?: Json
          presenter_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slide_id?: string
          ordem?: number
          tipo?: string
          titulo?: string
          subtitulo?: string | null
          conteudo?: Json
          presenter_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      slides: {
        Row: {
          id: string
          user_id: string
          instituicao: string
          disciplina: string
          assunto: string
          alunos: Json
          professores: Json
          status: string
          presentation_title: string
          generated_at: string | null
          created_at: string
          updated_at: string
          slide_color: string
        }
        Insert: {
          id?: string
          user_id: string
          instituicao: string
          disciplina: string
          assunto: string
          alunos?: Json
          professores?: Json
          status?: string
          presentation_title: string
          generated_at?: string | null
          created_at?: string
          updated_at?: string
          slide_color?: string
        }
        Update: {
          id?: string
          user_id?: string
          instituicao?: string
          disciplina?: string
          assunto?: string
          alunos?: Json
          professores?: Json
          status?: string
          presentation_title?: string
          generated_at?: string | null
          created_at?: string
          updated_at?: string
          slide_color?: string
        }
      }
      user_gabaritos: {
        Row: {
          user_id: string
          gabaritos: number
          trial_gabaritos_granted: boolean
          trial_started_at: string | null
          premium_reset_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          gabaritos?: number
          trial_gabaritos_granted?: boolean
          trial_started_at?: string | null
          premium_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          gabaritos?: number
          trial_gabaritos_granted?: boolean
          trial_started_at?: string | null
          premium_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_xp: {
        Row: {
          id: string
          user_id: string
          total_xp: number
          nivel: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_xp?: number
          nivel?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_xp?: number
          nivel?: number
          created_at?: string
          updated_at?: string
        }
      }
      xp_history: {
        Row: {
          id: string
          user_id: string
          xp_ganho: number
          acao: string
          referencia_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          xp_ganho: number
          acao: string
          referencia_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          xp_ganho?: number
          acao?: string
          referencia_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_gabaritos: {
        Args: { p_user_id: string; p_amount: number }
        Returns: boolean
      }
      adicionar_xp: {
        Args: {
          p_user_id: string
          p_xp_ganho: number
          p_acao: string
          p_referencia_id?: string | null
        }
        Returns: Json
      }
      atualizar_progresso_assunto: {
        Args: { p_user_id: string; p_assunto_id: string }
        Returns: void
      }
      buscar_xp_usuario: {
        Args: { p_user_id: string }
        Returns: Json
      }
      calcular_nivel: {
        Args: { p_total_xp: number }
        Returns: number
      }
      calcular_progresso_assunto: {
        Args: { p_user_id: string; p_assunto_id: string }
        Returns: number
      }
      calcular_progresso_concurso: {
        Args: { p_user_id: string; p_concurso_id: string }
        Returns: number
      }
      calcular_progresso_materia: {
        Args: { p_user_id: string; p_materia_id: string }
        Returns: number
      }
      calculate_simulado_cost: {
        Args: { p_num_questoes: number }
        Returns: number
      }
      deduct_gabaritos: {
        Args: { p_user_id: string; p_amount: number; p_description?: string }
        Returns: void
      }
      finalizar_sessao_estudo: {
        Args: { p_sessao_id: string }
        Returns: void
      }
      get_gabaritos_balance: {
        Args: { p_user_id: string }
        Returns: number
      }
      grant_trial_gabaritos: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      inicializar_progresso_assunto: {
        Args: { p_user_id: string; p_assunto_id: string }
        Returns: void
      }
      iniciar_sessao_estudo: {
        Args: { p_user_id: string; p_assunto_id: string }
        Returns: string
      }
      marcar_apostila_lida: {
        Args: { p_user_id: string; p_assunto_id: string }
        Returns: void
      }
      reset_premium_gabaritos: {
        Args: { p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
