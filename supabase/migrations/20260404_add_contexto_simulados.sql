-- Adiciona campo contexto na tabela simulados para separar simulados de cronograma vs livres
-- Data: 2026-04-04

-- Adicionar coluna contexto
ALTER TABLE simulados 
ADD COLUMN IF NOT EXISTS contexto TEXT DEFAULT 'livre' CHECK (contexto IN ('cronograma', 'livre'));

-- Atualizar simulados existentes que têm assunto_id como 'cronograma'
UPDATE simulados 
SET contexto = 'cronograma' 
WHERE assunto_id IS NOT NULL;

-- Comentário
COMMENT ON COLUMN simulados.contexto IS 'Contexto do simulado: cronograma (vinculado a um concurso) ou livre (sem vínculo)';
