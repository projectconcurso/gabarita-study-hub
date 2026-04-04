-- Tabela para registrar sessões de estudo do usuário
-- Data: 2026-03-26

CREATE TABLE IF NOT EXISTS sessoes_estudo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assunto_id UUID NOT NULL REFERENCES assuntos_materia(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('apostila', 'simulado')),
 _inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  _fim TIMESTAMP WITH TIME ZONE,
  duracao_segundos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_sessoes_estudo_user_id ON sessoes_estudo(user_id);
CREATE INDEX idx_sessoes_estudo_assunto_id ON sessoes_estudo(assunto_id);
CREATE INDEX idx_sessoes_estudo_tipo ON sessoes_estudo(tipo);
CREATE INDEX idx_sessoes_estudo_user_assunto ON sessoes_estudo(user_id, assunto_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessoes_estudo_updated_at 
    BEFORE UPDATE ON sessoes_estudo 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE sessoes_estudo ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver suas próprias sessões"
    ON sessoes_estudo FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias sessões"
    ON sessoes_estudo FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias sessões"
    ON sessoes_estudo FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias sessões"
    ON sessoes_estudo FOR DELETE
    USING (auth.uid() = user_id);

-- Comentário
COMMENT ON TABLE sessoes_estudo IS 'Registra sessões de estudo do usuário com tempo dedicado a cada assunto';
