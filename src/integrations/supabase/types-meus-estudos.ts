// Tipos temporários para as novas tabelas do sistema Meus Estudos
// Estes tipos serão substituídos quando rodar: npx supabase gen types typescript

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
      sessoes_estudo: {
        Row: {
          id: string
          user_id: string
          assunto_id: string
          inicio: string
          fim: string | null
          duracao_segundos: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assunto_id: string
          inicio: string
          fim?: string | null
          duracao_segundos?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assunto_id?: string
          inicio?: string
          fim?: string | null
          duracao_segundos?: number | null
          created_at?: string
        }
      }
    }
    Functions: {
      calcular_progresso_assunto: {
        Args: { p_user_id: string; p_assunto_id: string }
        Returns: number
      }
      calcular_progresso_materia: {
        Args: { p_user_id: string; p_materia_id: string }
        Returns: number
      }
      calcular_progresso_concurso: {
        Args: { p_user_id: string; p_concurso_id: string }
        Returns: number
      }
      marcar_apostila_lida: {
        Args: { p_user_id: string; p_assunto_id: string }
        Returns: void
      }
      iniciar_sessao_estudo: {
        Args: { p_user_id: string; p_assunto_id: string }
        Returns: string
      }
      finalizar_sessao_estudo: {
        Args: { p_sessao_id: string }
        Returns: void
      }
    }
  }
}
