-- Sistema Meus Estudos - Tabelas Principais
-- Data: 2026-03-26

-- 1. Concursos/Provas
CREATE TABLE IF NOT EXISTS concursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  data_prova DATE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_concursos_user_id ON concursos(user_id);

-- 2. Matérias do Concurso
CREATE TABLE IF NOT EXISTS materias_concurso (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concurso_id UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_materias_concurso_id ON materias_concurso(concurso_id);

-- 3. Assuntos da Matéria
CREATE TABLE IF NOT EXISTS assuntos_materia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materia_id UUID NOT NULL REFERENCES materias_concurso(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assuntos_materia_id ON assuntos_materia(materia_id);

-- 4. Apostilas
CREATE TABLE IF NOT EXISTS apostilas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assunto_id UUID NOT NULL REFERENCES assuntos_materia(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'gerada',
  custo_gabaritos INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_apostilas_assunto_id ON apostilas(assunto_id);

-- 5. Progresso de Estudos
CREATE TABLE IF NOT EXISTS progresso_estudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assunto_id UUID NOT NULL REFERENCES assuntos_materia(id) ON DELETE CASCADE,
  apostila_lida BOOLEAN DEFAULT FALSE,
  data_leitura_apostila TIMESTAMP WITH TIME ZONE,
  simulados_concluidos INTEGER DEFAULT 0,
  tempo_estudo_segundos INTEGER DEFAULT 0,
  percentual_conclusao DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, assunto_id)
);

CREATE INDEX idx_progresso_user_id ON progresso_estudos(user_id);
CREATE INDEX idx_progresso_assunto_id ON progresso_estudos(assunto_id);

-- 6. Sessões de Estudo
CREATE TABLE IF NOT EXISTS sessoes_estudo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assunto_id UUID NOT NULL REFERENCES assuntos_materia(id) ON DELETE CASCADE,
  inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fim TIMESTAMP WITH TIME ZONE,
  duracao_segundos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessoes_user_id ON sessoes_estudo(user_id);
CREATE INDEX idx_sessoes_assunto_id ON sessoes_estudo(assunto_id);

-- 7. Adicionar coluna em simulados
ALTER TABLE simulados 
ADD COLUMN IF NOT EXISTS assunto_id UUID REFERENCES assuntos_materia(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_simulados_assunto_id ON simulados(assunto_id);
