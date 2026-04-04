ALTER TABLE simulados ADD COLUMN IF NOT EXISTS assunto_id UUID REFERENCES assuntos_materia(id);

CREATE INDEX IF NOT EXISTS idx_simulados_assunto_id ON simulados(assunto_id);

SELECT 'Campo assunto_id adicionado na tabela simulados!' AS status;
