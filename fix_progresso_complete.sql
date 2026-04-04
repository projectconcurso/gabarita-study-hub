CREATE OR REPLACE FUNCTION atualizar_progresso_assunto(
  p_user_id UUID,
  p_assunto_id UUID
) RETURNS VOID AS $$
DECLARE
  v_novo_progresso DECIMAL(5,2);
  v_simulados_concluidos INTEGER;
  v_apostila_lida BOOLEAN;
  v_progresso_apostila DECIMAL(5,2);
  v_progresso_simulados DECIMAL(5,2);
BEGIN
  -- Primeiro garante que o registro existe
  INSERT INTO progresso_estudos (user_id, assunto_id)
  VALUES (p_user_id, p_assunto_id)
  ON CONFLICT (user_id, assunto_id) DO NOTHING;
  
  -- Busca dados do progresso
  SELECT simulados_concluidos, apostila_lida
  INTO v_simulados_concluidos, v_apostila_lida
  FROM progresso_estudos
  WHERE user_id = p_user_id AND assunto_id = p_assunto_id;
  
  -- Calcula progresso da apostila (50% se lida)
  v_progresso_apostila := CASE WHEN COALESCE(v_apostila_lida, FALSE) THEN 50 ELSE 0 END;
  
  -- Calcula progresso dos simulados (50% dividido por 3 simulados = 16.67% cada)
  v_progresso_simulados := LEAST(COALESCE(v_simulados_concluidos, 0) * 16.67, 50);
  
  -- Progresso total = apostila (50%) + simulados (50%)
  v_novo_progresso := v_progresso_apostila + v_progresso_simulados;

  -- Atualiza o percentual
  UPDATE progresso_estudos
  SET percentual_conclusao = v_novo_progresso,
      updated_at = NOW()
  WHERE user_id = p_user_id AND assunto_id = p_assunto_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Corrigir função marcar_apostila_lida
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
  
  -- Atualiza o progresso (agora a função está corrigida)
  PERFORM atualizar_progresso_assunto(p_user_id, p_assunto_id);
END;
$$ LANGUAGE plpgsql;

-- Mensagem de sucesso
SELECT 'Funções de progresso corrigidas com sucesso!' AS status;
