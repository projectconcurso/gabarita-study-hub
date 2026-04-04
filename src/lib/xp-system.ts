import { supabase } from "@/integrations/supabase/client";
import type { XPInfo, AdicionarXPResult, XPHistory } from "@/types/xp-system";

/**
 * Busca informações de XP e nível do usuário
 */
export const buscarXPUsuario = async (userId: string): Promise<XPInfo> => {
  // @ts-ignore - RPC function will be available after migration
  const { data, error } = await supabase.rpc("buscar_xp_usuario", {
    p_user_id: userId,
  });

  if (error) throw error;
  return data as XPInfo;
};

/**
 * Adiciona XP ao usuário (usado internamente pelos triggers)
 * Normalmente não precisa ser chamado manualmente
 */
export const adicionarXP = async (
  userId: string,
  xpGanho: number,
  acao: "simulado_concluido" | "apostila_lida",
  referenciaId?: string
): Promise<AdicionarXPResult> => {
  // @ts-ignore - RPC function will be available after migration
  const { data, error } = await supabase.rpc("adicionar_xp", {
    p_user_id: userId,
    p_xp_ganho: xpGanho,
    p_acao: acao,
    p_referencia_id: referenciaId || null,
  });

  if (error) throw error;
  return data as AdicionarXPResult;
};

/**
 * Busca histórico de XP do usuário
 */
export const buscarHistoricoXP = async (
  userId: string,
  limit: number = 50
): Promise<XPHistory[]> => {
  // @ts-ignore - Table will be available after migration
  const { data, error } = await supabase
    .from("xp_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as XPHistory[];
};

/**
 * Calcula nível baseado em XP
 */
export const calcularNivel = (totalXP: number): number => {
  return Math.min(Math.floor(totalXP / 10), 100);
};

/**
 * Calcula XP necessário para próximo nível
 */
export const calcularXPParaProximoNivel = (totalXP: number): number => {
  return 10 - (totalXP % 10);
};

/**
 * Calcula progresso percentual para o próximo nível
 */
export const calcularProgressoNivel = (totalXP: number): number => {
  return (totalXP % 10) * 10; // 0-100%
};

/**
 * Formata descrição da ação de XP
 */
export const formatarAcaoXP = (acao: string): string => {
  const acoes: Record<string, string> = {
    simulado_concluido: "Simulado concluído",
    apostila_lida: "Apostila lida",
  };
  return acoes[acao] || acao;
};

/**
 * Retorna emoji baseado no nível
 */
export const getEmojiNivel = (nivel: number): string => {
  if (nivel === 0) return "🥚"; // Iniciante
  if (nivel < 10) return "🐣"; // Novato
  if (nivel < 25) return "🐥"; // Aprendiz
  if (nivel < 50) return "🦅"; // Intermediário
  if (nivel < 75) return "🦉"; // Avançado
  if (nivel < 100) return "🦚"; // Expert
  return "👑"; // Mestre (nível 100)
};

/**
 * Retorna título baseado no nível
 */
export const getTituloNivel = (nivel: number): string => {
  if (nivel === 0) return "Iniciante";
  if (nivel < 10) return "Novato";
  if (nivel < 25) return "Aprendiz";
  if (nivel < 50) return "Intermediário";
  if (nivel < 75) return "Avançado";
  if (nivel < 100) return "Expert";
  return "Mestre"; // nível 100
};

/**
 * Retorna cor baseada no nível
 */
export const getCorNivel = (nivel: number): string => {
  if (nivel === 0) return "text-gray-500";
  if (nivel < 10) return "text-blue-500";
  if (nivel < 25) return "text-green-500";
  if (nivel < 50) return "text-yellow-500";
  if (nivel < 75) return "text-orange-500";
  if (nivel < 100) return "text-red-500";
  return "text-purple-600"; // nível 100
};

/**
 * Retorna cor de fundo baseada no nível
 */
export const getBgNivel = (nivel: number): string => {
  if (nivel === 0) return "bg-gray-100";
  if (nivel < 10) return "bg-blue-100";
  if (nivel < 25) return "bg-green-100";
  if (nivel < 50) return "bg-yellow-100";
  if (nivel < 75) return "bg-orange-100";
  if (nivel < 100) return "bg-red-100";
  return "bg-purple-100"; // nível 100
};
