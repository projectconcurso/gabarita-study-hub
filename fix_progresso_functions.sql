-- Corrigir função atualizar_progresso_assunto para usar UPSERT
CREATE OR REPLACE FUNCTION atualizar_progresso_assunto(
  p_user_id UUID,
  p_assunto_id UUID
) RETURNS VOID AS $$
DECLARE
  v_novo_progresso DECIMAL(5,2);
  v_simulados_concluidos INTEGER;
BEGIN
  -- Primeiro garante que o registro existe
  INSERT INTO progresso_estudos (user_id, assunto_id)
  VALUES (p_user_id, p_assunto_id)
  ON CONFLICT (user_id, assunto_id) DO NOTHING;
  
  -- Agora calcula o progresso
  SELECT simulados_concluidos
  INTO v_simulados_concluidos
  FROM progresso_estudos
  WHERE user_id = p_user_id AND assunto_id = p_assunto_id;
  
  -- Cada simulado vale 33.33%, máximo 100% com 3 simulados
  v_novo_progresso := LEAST(COALESCE(v_simulados_concluidos, 0) * 33.33, 100);

  -- Atualiza o percentual
  UPDATE progresso_estudos
  SET percentual_conclusao = v_novo_progresso,
      updated_at = NOW()
  WHERE user_id = p_user_id AND assunto_id = p_assunto_id;
END;
$$ LANGUAGE plpgsql;

-- Corrigir função marcar_apostila_lida para usar UPSERT
CREATE OR REPLACE FUNCTION marcar_apostila_lida(
  p_user_id UUID,
  p_assunto_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Usar UPSERT para garantir que o registro existe
  INSERT INTO progresso_estudos (user_id, assunto_id, apostila_lida, data_leitura_apostila)
  VALUES (p_user_id, p_assunto_id, TRUE, NOW())
  ON CONFLICT (user_id, assunto_id) 
  DO UPDATE SET 
    apostila_lida = TRUE,
    data_leitura_apostila = NOW(),
    updated_at = NOW();
  
  PERFORM atualizar_progresso_assunto(p_user_id, p_assunto_id);
END;
$$ LANGUAGE plpgsql;
