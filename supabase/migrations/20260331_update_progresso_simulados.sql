-- Atualiza lógica de progresso: 3 simulados = 100%
-- Data: 2026-03-31

-- Função atualizada: Calcular progresso de um assunto
-- Nova regra: 3 simulados concluídos = 100% (33.33% cada)
CREATE OR REPLACE FUNCTION calcular_progresso_assunto(
  p_user_id UUID,
  p_assunto_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_simulados_concluidos INTEGER;
  v_progresso DECIMAL(5,2);
BEGIN
  SELECT simulados_concluidos
  INTO v_simulados_concluidos
  FROM progresso_estudos
  WHERE user_id = p_user_id AND assunto_id = p_assunto_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Cada simulado vale 33.33%, máximo 100% com 3 simulados
  v_progresso := LEAST(v_simulados_concluidos * 33.33, 100);

  RETURN v_progresso;
END;
$$ LANGUAGE plpgsql;

-- Comentário explicativo
COMMENT ON FUNCTION calcular_progresso_assunto IS 'Calcula progresso baseado em simulados: 3 simulados = 100% (33.33% cada)';
