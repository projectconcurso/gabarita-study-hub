// Sistema de XP e Níveis
// Tipos TypeScript

export interface UserXP {
  id: string;
  user_id: string;
  total_xp: number;
  nivel: number;
  created_at: string;
  updated_at: string;
}

export interface XPHistory {
  id: string;
  user_id: string;
  xp_ganho: number;
  acao: 'simulado_concluido' | 'apostila_lida';
  referencia_id: string | null;
  created_at: string;
}

export interface XPInfo {
  total_xp: number;
  nivel: number;
  xp_para_proximo_nivel: number;
  progresso_nivel: number; // 0-100 (porcentagem)
}

export interface AdicionarXPResult {
  xp_anterior: number;
  xp_ganho: number;
  xp_novo: number;
  nivel_anterior: number;
  nivel_novo: number;
  subiu_nivel: boolean;
}
