-- Atualizar função de cálculo de custo de simulado
-- Novo sistema: mínimo 5 questões, máximo 20, cada questão = 2 Gabaritos
CREATE OR REPLACE FUNCTION public.calculate_simulado_cost(questoes_count INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar limites
  IF questoes_count < 5 OR questoes_count > 20 THEN
    RAISE EXCEPTION 'Número de questões deve estar entre 5 e 20';
  END IF;
  
  -- Cada questão custa 2 Gabaritos
  RETURN questoes_count * 2;
END;
$$;

COMMENT ON FUNCTION public.calculate_simulado_cost IS 'Calcula custo em Gabaritos: cada questão = 2 Gabaritos (mín: 5, máx: 20)';
