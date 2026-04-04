CREATE OR REPLACE FUNCTION registrar_simulado_concluido(
  p_user_id UUID,
  p_simulado_id UUID
) RETURNS VOID AS $$
DECLARE
  v_assunto_id UUID;
  v_simulados_atuais INTEGER;
BEGIN
  SELECT assunto_id INTO v_assunto_id
  FROM simulados
  WHERE id = p_simulado_id;
  
  IF v_assunto_id IS NULL THEN
    RETURN;
  END IF;
  
  INSERT INTO progresso_estudos (user_id, assunto_id, simulados_concluidos)
  VALUES (p_user_id, v_assunto_id, 1)
  ON CONFLICT (user_id, assunto_id)
  DO UPDATE SET
    simulados_concluidos = COALESCE(progresso_estudos.simulados_concluidos, 0) + 1,
    updated_at = NOW();
  
  PERFORM atualizar_progresso_assunto(p_user_id, v_assunto_id);
END;
$$ LANGUAGE plpgsql;

SELECT 'Funcao registrar_simulado_concluido criada com sucesso!' AS status;
