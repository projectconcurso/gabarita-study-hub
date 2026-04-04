ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp_atual INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp_proximo_nivel INTEGER DEFAULT 100;

UPDATE profiles SET nivel = 1 WHERE nivel IS NULL;
UPDATE profiles SET xp_atual = 0 WHERE xp_atual IS NULL;
UPDATE profiles SET xp_proximo_nivel = 100 WHERE xp_proximo_nivel IS NULL;

SELECT 'Campos de nivel e XP adicionados na tabela profiles!' AS status;
