import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  Concurso,
  MateriaConcurso,
  AssuntoMateria,
  Apostila,
  ProgressoEstudos,
  SessaoEstudo,
  ConcursoFormData,
  GerarApostilaResponse,
} from "@/types/meus-estudos";

// =====================================================
// CONCURSOS
// =====================================================

export const listarConcursos = async (userId: string) => {
  const { data, error } = await supabase
    .from("concursos")
    .select("*")
    .eq("user_id", userId)
    .eq("ativo", true)
    .order("data_prova", { ascending: true });

  if (error) throw error;
  return data as Concurso[];
};

export const buscarConcurso = async (concursoId: string) => {
  const { data, error } = await supabase
    .from("concursos")
    .select("*")
    .eq("id", concursoId)
    .single();

  if (error) throw error;
  return data as Concurso;
};

export const criarConcurso = async (formData: ConcursoFormData, userId: string) => {
  // 1. Criar concurso
  const { data: concurso, error: concursoError } = await supabase
    .from("concursos")
    .insert({
      user_id: userId,
      nome: formData.nome,
      data_prova: formData.data_prova || null,
      descricao: formData.descricao || null,
    } as any)
    .select()
    .single();

  if (concursoError || !concurso) throw concursoError || new Error('Erro ao criar concurso');

  // 2. Criar matérias e assuntos
  for (const materia of formData.materias) {
    const { data: materiaCriada, error: materiaError } = await supabase
      .from("materias_concurso")
      .insert({
        concurso_id: (concurso as any).id,
        nome: materia.nome,
        ordem: materia.ordem,
      } as any)
      .select()
      .single();

    if (materiaError || !materiaCriada) throw materiaError || new Error('Erro ao criar matéria');

    // 3. Criar assuntos da matéria
    if (materia.assuntos.length > 0) {
      const assuntosParaInserir = materia.assuntos.map((assunto) => ({
        materia_id: (materiaCriada as any).id,
        nome: assunto.nome,
        ordem: assunto.ordem,
      }));

      const { error: assuntosError } = await supabase
        .from("assuntos_materia")
        .insert(assuntosParaInserir as any);

      if (assuntosError) throw assuntosError;
    }
  }

  return concurso as Concurso;
};

export const atualizarConcurso = async (
  concursoId: string,
  updates: Partial<Concurso>
) => {
  const { data, error } = await supabase
    .from("concursos")
    // @ts-ignore - Update types will be available after full type generation
    .update(updates)
    .eq("id", concursoId)
    .select()
    .single();

  if (error) throw error;
  return data as Concurso;
};

export const deletarConcurso = async (concursoId: string) => {
  const { error } = await supabase
    .from("concursos")
    .delete()
    .eq("id", concursoId);

  if (error) throw error;
};

// =====================================================
// MATÉRIAS
// =====================================================

export const listarMateriasConcurso = async (concursoId: string) => {
  const { data, error } = await supabase
    .from("materias_concurso")
    .select("*")
    .eq("concurso_id", concursoId)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data as MateriaConcurso[];
};

export const adicionarMateria = async (
  concursoId: string,
  nome: string,
  ordem: number
) => {
  const { data, error } = await supabase
    .from("materias_concurso")
    .insert({
      concurso_id: concursoId,
      nome,
      ordem,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as MateriaConcurso;
};

// =====================================================
// ASSUNTOS
// =====================================================

export const listarAssuntosMateria = async (materiaId: string) => {
  const { data, error } = await supabase
    .from("assuntos_materia")
    .select("*")
    .eq("materia_id", materiaId)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data as AssuntoMateria[];
};

export const adicionarAssunto = async (
  materiaId: string,
  nome: string,
  ordem: number
) => {
  const { data, error } = await supabase
    .from("assuntos_materia")
    .insert({
      materia_id: materiaId,
      nome,
      ordem,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as AssuntoMateria;
};

// =====================================================
// APOSTILAS
// =====================================================

export const buscarAssunto = async (assuntoId: string) => {
  const { data, error } = await supabase
    .from("assuntos_materia")
    .select("*")
    .eq("id", assuntoId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as AssuntoMateria | null;
};

export const buscarApostila = async (assuntoId: string) => {
  console.log('🔍 Buscando apostila para assunto:', assuntoId);
  
  try {
    const { data, error } = await supabase
      .from("apostilas")
      .select("id, assunto_id, conteudo, status, custo_gabaritos, created_at")
      .eq("assunto_id", assuntoId)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar apostila:', error);
      throw error;
    }
    
    if (!data) {
      console.log('ℹ️ Nenhuma apostila encontrada para assunto:', assuntoId);
      return null;
    }
    
    console.log('✅ Apostila encontrada:', (data as any).id);
    return data as Apostila;
  } catch (err) {
    console.error('❌ Exceção ao buscar apostila:', err);
    return null;
  }
};

export const gerarApostila = async (
  assuntoId: string,
  userId: string,
  nomeAssunto: string,
  nomeMateria: string
): Promise<GerarApostilaResponse> => {
  const { data, error } = await supabase.functions.invoke("gerar-apostila", {
    body: {
      assuntoId,
      userId,
      nomeAssunto,
      nomeMateria,
    },
  });

  if (error) throw error;
  return data as GerarApostilaResponse;
};

export const marcarApostilaComoLida = async (
  userId: string,
  assuntoId: string
) => {
  // @ts-expect-error - RPC types will be available after full type generation
  const { error } = await supabase.rpc("marcar_apostila_lida", {
    p_user_id: userId,
    p_assunto_id: assuntoId,
  });

  if (error) throw error;
};

// =====================================================
// TEMPO DE ESTUDO AGREGADO
// =====================================================

export const calcularTempoAssunto = async (userId: string, assuntoId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("sessoes_estudo")
    .select("duracao_segundos")
    .eq("user_id", userId)
    .eq("assunto_id", assuntoId)
    .not("duracao_segundos", "is", null);

  if (error) throw error;
  
  return data?.reduce((total, sessao) => total + ((sessao as any).duracao_segundos || 0), 0) || 0;
};

export const calcularTempoMateria = async (userId: string, materiaId: string): Promise<number> => {
  // Primeiro busca os assuntos da matéria
  const { data: assuntos, error: assuntosError } = await supabase
    .from("assuntos_materia")
    .select("id")
    .eq("materia_id", materiaId);

  if (assuntosError) throw assuntosError;
  if (!assuntos || assuntos.length === 0) return 0;

  // Depois busca as sessões desses assuntos
  const assuntoIds = assuntos.map(a => (a as any).id);
  const { data, error } = await supabase
    .from("sessoes_estudo")
    .select("duracao_segundos")
    .eq("user_id", userId)
    .in("assunto_id", assuntoIds);

  if (error) throw error;
  
  return data?.reduce((total, sessao) => total + ((sessao as any).duracao_segundos || 0), 0) || 0;
};

export const calcularTempoConcurso = async (userId: string, concursoId: string): Promise<number> => {
  // Primeiro busca as matérias do concurso
  const { data: materias, error: materiasError } = await supabase
    .from("materias_concurso")
    .select("id")
    .eq("concurso_id", concursoId);

  if (materiasError) throw materiasError;
  if (!materias || materias.length === 0) return 0;

  // Depois busca os assuntos dessas matérias
  const materiaIds = materias.map(m => (m as any).id);
  const { data: assuntos, error: assuntosError } = await supabase
    .from("assuntos_materia")
    .select("id")
    .in("materia_id", materiaIds);

  if (assuntosError) throw assuntosError;
  if (!assuntos || assuntos.length === 0) return 0;

  // Finalmente busca as sessões desses assuntos
  const assuntoIds = assuntos.map(a => (a as any).id);
  const { data, error } = await supabase
    .from("sessoes_estudo")
    .select("duracao_segundos")
    .eq("user_id", userId)
    .in("assunto_id", assuntoIds);

  if (error) throw error;
  
  return data?.reduce((total, sessao) => total + ((sessao as any).duracao_segundos || 0), 0) || 0;
};

export const getTempoDetalhadoMateria = async (userId: string, materiaId: string) => {
  // Busca todos os assuntos da matéria
  const { data: assuntos, error: assuntosError } = await supabase
    .from("assuntos_materia")
    .select("id, nome")
    .eq("materia_id", materiaId);

  if (assuntosError) throw assuntosError;

  // Calcula tempo para cada assunto
  const assuntosComTempo = await Promise.all(
    (assuntos || []).map(async (assunto) => {
      const tempo = await calcularTempoAssunto(userId, (assunto as any).id);
      return {
        id: (assunto as any).id,
        nome: (assunto as any).nome,
        tempo_segundos: tempo,
      };
    })
  );

  // Calcula tempo total da matéria
  const tempoTotal = assuntosComTempo.reduce((total, assunto) => total + assunto.tempo_segundos, 0);

  return {
    tempo_total_segundos: tempoTotal,
    assuntos: assuntosComTempo.filter(assunto => assunto.tempo_segundos > 0),
  };
};

export const getTempoDetalhadoConcurso = async (userId: string, concursoId: string) => {
  // Busca todas as matérias do concurso
  const { data: materias, error: materiasError } = await supabase
    .from("materias_concurso")
    .select("id, nome")
    .eq("concurso_id", concursoId);

  if (materiasError) throw materiasError;

  // Calcula tempo para cada matéria
  const materiasComTempo = await Promise.all(
    (materias || []).map(async (materia) => {
      const detalhes = await getTempoDetalhadoMateria(userId, (materia as any).id);
      return {
        id: (materia as any).id,
        nome: (materia as any).nome,
        tempo_total_segundos: detalhes.tempo_total_segundos,
        assuntos: detalhes.assuntos,
      };
    })
  );

  // Calcula tempo total do concurso
  const tempoTotal = materiasComTempo.reduce((total, materia) => total + materia.tempo_total_segundos, 0);

  return {
    tempo_total_segundos: tempoTotal,
    materias: materiasComTempo.filter(materia => materia.tempo_total_segundos > 0),
  };
};

// =====================================================
// PROGRESSO
// =====================================================

export const buscarProgressoAssunto = async (
  userId: string,
  assuntoId: string
) => {
  const { data, error } = await supabase
    .from("progresso_estudos")
    .select("*")
    .eq("user_id", userId)
    .eq("assunto_id", assuntoId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as ProgressoEstudos | null;
};

export const calcularProgressoAssunto = async (
  userId: string,
  assuntoId: string
): Promise<number> => {
  // @ts-expect-error - RPC types will be available after full type generation
  const { data, error } = await supabase.rpc("calcular_progresso_assunto", {
    p_user_id: userId,
    p_assunto_id: assuntoId,
  });

  if (error) throw error;
  return data as number;
};

export const calcularProgressoMateria = async (
  userId: string,
  materiaId: string
): Promise<number> => {
  // @ts-expect-error - RPC types will be available after full type generation
  const { data, error } = await supabase.rpc("calcular_progresso_materia", {
    p_user_id: userId,
    p_materia_id: materiaId,
  });

  if (error) throw error;
  return data as number;
};

export const calcularProgressoConcurso = async (
  userId: string,
  concursoId: string
): Promise<number> => {
  // @ts-expect-error - RPC types will be available after full type generation
  const { data, error } = await supabase.rpc("calcular_progresso_concurso", {
    p_user_id: userId,
    p_concurso_id: concursoId,
  });

  if (error) throw error;
  return data as number;
};

// =====================================================
// SESSÕES DE ESTUDO (CRONÔMETRO)
// =====================================================

export const iniciarSessaoEstudo = async (
  userId: string,
  assuntoId: string
): Promise<string> => {
  // @ts-expect-error - RPC types will be available after full type generation
  const { data, error } = await supabase.rpc("iniciar_sessao_estudo", {
    p_user_id: userId,
    p_assunto_id: assuntoId,
  });

  if (error) throw error;
  return data as string;
};

export const finalizarSessaoEstudo = async (sessaoId: string) => {
  // @ts-expect-error - RPC types will be available after full type generation
  const { error } = await supabase.rpc("finalizar_sessao_estudo", {
    p_sessao_id: sessaoId,
  });

  if (error) throw error;
};

export const buscarSessoesEstudo = async (
  userId: string,
  assuntoId: string
) => {
  const { data, error } = await supabase
    .from("sessoes_estudo")
    .select("*")
    .eq("user_id", userId)
    .eq("assunto_id", assuntoId)
    .order("inicio", { ascending: false });

  if (error) throw error;
  return data as SessaoEstudo[];
};

// =====================================================
// SIMULADOS VINCULADOS
// =====================================================

export const listarSimuladosVinculados = async (
  userId: string,
  materiaNome: string,
  assuntoNome: string,
  assuntoId?: string
) => {
  let query = supabase
    .from("simulados")
    .select("*")
    .eq("user_id", userId)
    .eq("contexto", "cronograma");

  // Prioriza filtro por assunto_id se disponível
  if (assuntoId) {
    query = query.eq("assunto_id", assuntoId);
  } else {
    // Fallback para materia e tema
    query = query.eq("materia", materiaNome).eq("tema", assuntoNome);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const contarSimuladosConcluidosAssunto = async (
  userId: string,
  assuntoId: string
): Promise<number> => {
  const { count, error } = await supabase
    .from("simulados")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("assunto_id", assuntoId)
    .eq("status", "concluido");

  if (error) throw error;
  return count ?? 0;
};

export const contarSimuladosAssunto = async (
  userId: string,
  materiaNome: string,
  assuntoNome: string,
  assuntoId?: string
): Promise<number> => {
  // Se tiver assunto_id, usa ele (mais preciso)
  if (assuntoId) {
    const { count, error } = await supabase
      .from("simulados")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("assunto_id", assuntoId)
      .eq("contexto", "cronograma");

    if (error) throw error;
    return count ?? 0;
  }
  
  // Fallback: usa materia e tema (para compatibilidade com simulados antigos)
  const { count, error } = await supabase
    .from("simulados")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("materia", materiaNome)
    .eq("tema", assuntoNome)
    .eq("contexto", "cronograma");

  if (error) throw error;
  return count ?? 0;
};

// =====================================================
// HELPERS
// =====================================================

export const formatarTempoEstudo = (segundos: number): string => {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);

  if (horas > 0) {
    return `${horas}h ${minutos}min`;
  }
  if (minutos > 0) {
    return `${minutos}min`;
  }
  return "< 1min";
};

export const formatarDataProva = (data: string | null): string => {
  if (!data) return "Sem data definida";

  const dataProva = new Date(data);
  const hoje = new Date();
  const diffTime = dataProva.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Prova realizada";
  }
  if (diffDays === 0) {
    return "Hoje!";
  }
  if (diffDays === 1) {
    return "Amanhã";
  }
  if (diffDays <= 7) {
    return `Em ${diffDays} dias`;
  }
  if (diffDays <= 30) {
    const semanas = Math.floor(diffDays / 7);
    return `Em ${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
  }

  const meses = Math.floor(diffDays / 30);
  return `Em ${meses} ${meses === 1 ? "mês" : "meses"}`;
};
