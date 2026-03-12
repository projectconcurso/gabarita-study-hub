-- Adicionar novos campos ao perfil do usuário

-- Escolaridade (Fundamental, Médio, Superior)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS escolaridade TEXT;

-- O que está cursando (opcional)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS curso TEXT;

-- Data de nascimento (para calcular idade)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- Cidade e Estado
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cidade TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS estado TEXT;

-- Foto do perfil (opcional)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Matéria Forte e Matéria Fraca (renomear/adicionar campos específicos)
-- area_forte e area_fraca já existem, vamos garantir que estão corretos

-- Comentários nos campos para documentação
COMMENT ON COLUMN public.profiles.escolaridade IS 'Ensino Fundamental, Médio ou Superior (obrigatório)';
COMMENT ON COLUMN public.profiles.curso IS 'O que está cursando atualmente (opcional)';
COMMENT ON COLUMN public.profiles.data_nascimento IS 'Data de nascimento para cálculo de idade (obrigatório)';
COMMENT ON COLUMN public.profiles.cidade IS 'Cidade do usuário (obrigatório)';
COMMENT ON COLUMN public.profiles.estado IS 'Estado do usuário (obrigatório)';
COMMENT ON COLUMN public.profiles.foto_url IS 'URL da foto de perfil (opcional)';
COMMENT ON COLUMN public.profiles.area_forte IS 'Matéria forte do usuário (obrigatório)';
COMMENT ON COLUMN public.profiles.area_fraca IS 'Matéria fraca do usuário (obrigatório)';
