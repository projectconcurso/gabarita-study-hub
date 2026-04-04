// Tipos para o Sistema Meus Estudos

export interface Concurso {
  id: string;
  user_id: string;
  nome: string;
  data_prova: string | null;
  descricao: string | null;
  escolaridade: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MateriaConcurso {
  id: string;
  concurso_id: string;
  nome: string;
  ordem: number;
  created_at: string;
}

export interface AssuntoMateria {
  id: string;
  materia_id: string;
  nome: string;
  ordem: number;
  created_at: string;
}

export interface Apostila {
  id: string;
  assunto_id: string;
  conteudo: string;
  status: string;
  custo_gabaritos: number;
  created_at: string;
}

export interface ProgressoEstudos {
  id: string;
  user_id: string;
  assunto_id: string;
  apostila_lida: boolean;
  data_leitura_apostila: string | null;
  simulados_concluidos: number;
  tempo_estudo_segundos: number;
  percentual_conclusao: number;
  created_at: string;
  updated_at: string;
}

export interface SessaoEstudo {
  id: string;
  user_id: string;
  assunto_id: string;
  inicio: string;
  fim: string | null;
  duracao_segundos: number | null;
  created_at: string;
}

// Tipos compostos para exibição

export interface ConcursoComProgresso extends Concurso {
  progresso: number;
  total_materias: number;
  total_assuntos: number;
}

export interface MateriaComProgresso extends MateriaConcurso {
  progresso: number;
  assuntos: AssuntoComProgresso[];
}

export interface AssuntoComProgresso extends AssuntoMateria {
  progresso: ProgressoEstudos | null;
  apostila: Apostila | null;
  tem_apostila: boolean;
  simulados_vinculados: number;
}

// Tipos para formulários

export interface ConcursoFormData {
  nome: string;
  data_prova: string;
  descricao: string;
  escolaridade: string;
  materias: MateriaFormData[];
}

export interface MateriaFormData {
  id?: string;
  nome: string;
  ordem: number;
  assuntos: AssuntoFormData[];
}

export interface AssuntoFormData {
  id?: string;
  nome: string;
  ordem: number;
}

// Tipos para respostas de API

export interface GerarApostilaResponse {
  success: boolean;
  apostila?: Apostila;
  gabaritos_debitados?: number;
  message?: string;
  error?: string;
  required?: number;
  available?: number;
}

export interface ProgressoResponse {
  assunto_id: string;
  percentual: number;
  apostila_lida: boolean;
  simulados_concluidos: number;
  tempo_estudo_formatado: string;
}

// Enums

export enum StatusApostila {
  GERADA = "gerada",
  PROCESSANDO = "processando",
  ERRO = "erro",
}

export enum NivelProgresso {
  NAO_INICIADO = 0,
  EM_ANDAMENTO = 1,
  CONCLUIDO = 100,
}

// Helpers

export const formatarTempoEstudo = (segundos: number): string => {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  
  if (horas > 0) {
    return `${horas}h ${minutos}min`;
  }
  return `${minutos}min`;
};

export const getCorProgresso = (percentual: number): string => {
  if (percentual === 0) return "text-gray-500";
  if (percentual < 50) return "text-blue-600";
  if (percentual < 100) return "text-primary";
  return "text-green-600";
};

export const getBgProgresso = (percentual: number): string => {
  if (percentual === 0) return "bg-gray-100";
  if (percentual < 50) return "bg-blue-100";
  if (percentual < 100) return "bg-primary/10";
  return "bg-green-100";
};

export const getBorderProgresso = (percentual: number): string => {
  if (percentual === 0) return "border-gray-300";
  if (percentual < 50) return "border-blue-300";
  if (percentual < 100) return "border-primary/30";
  return "border-green-300";
};
