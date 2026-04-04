-- Sistema Meus Estudos - Funções Auxiliares
-- Data: 2026-03-26

-- Função: Calcular progresso de um assunto
-- Regra: Apostila lida (50%) + 1º simulado (25%) + 2º simulado (25%) = 100%
CREATE OR REPLACE FUNCTION calcular_progresso_assunto(
  p_user_id UUID,
  p_assunto_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_apostila_lida BOOLEAN;
  v_simulados_concluidos INTEGER;
  v_progresso DECIMAL(5,2);
BEGIN
  SELECT apostila_lida, simulados_concluidos
  INTO v_apostila_lida, v_simulados_concluidos
  FROM progresso_estudos
  WHERE user_id = p_user_id AND assunto_id = p_assunto_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  v_progresso := 0;
  
  IF v_apostila_lida THEN
    v_progresso := v_progresso + 50;
  END IF;
  
  IF v_simulados_concluidos >= 1 THEN
    v_progresso := v_progresso + 25;
  END IF;
  
  IF v_simulados_concluidos >= 2 THEN
    v_progresso := v_progresso + 25;
  END IF;

  RETURN v_progresso;
END;
$$ LANGUAGE plpgsql;

-- Função: Calcular progresso de uma matéria (média dos assuntos)
CREATE OR REPLACE FUNCTION calcular_progresso_materia(
  p_user_id UUID,
  p_materia_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_total_assuntos INTEGER;
  v_soma_progressos DECIMAL(10,2);
BEGIN
  SELECT COUNT(*)
  INTO v_total_assuntos
  FROM assuntos_materia
  WHERE materia_id = p_materia_id;

  IF v_total_assuntos = 0 THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(pe.percentual_conclusao), 0)
  INTO v_soma_progressos
  FROM assuntos_materia am
  LEFT JOIN progresso_estudos pe ON pe.assunto_id = am.id AND pe.user_id = p_user_id
  WHERE am.materia_id = p_materia_id;

  RETURN v_soma_progressos / v_total_assuntos;
END;
$$ LANGUAGE plpgsql;

-- Função: Calcular progresso de um concurso (média das matérias)
CREATE OR REPLACE FUNCTION calcular_progresso_concurso(
  p_user_id UUID,
  p_concurso_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_total_materias INTEGER;
  v_soma_progressos DECIMAL(10,2);
BEGIN
  SELECT COUNT(*)
  INTO v_total_materias
  FROM materias_concurso
  WHERE concurso_id = p_concurso_id;

  IF v_total_materias = 0 THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(calcular_progresso_materia(p_user_id, mc.id)), 0)
  INTO v_soma_progressos
  FROM materias_concurso mc
  WHERE mc.concurso_id = p_concurso_id;

  RETURN v_soma_progressos / v_total_materias;
END;
$$ LANGUAGE plpgsql;

-- Função: Atualizar progresso de um assunto
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

-- Função: Inicializar progresso de um assunto
CREATE OR REPLACE FUNCTION inicializar_progresso_assunto(
  p_user_id UUID,
  p_assunto_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO progresso_estudos (user_id, assunto_id)
  VALUES (p_user_id, p_assunto_id)
  ON CONFLICT (user_id, assunto_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Função: Marcar apostila como lida
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

-- Função: Iniciar sessão de estudo
CREATE OR REPLACE FUNCTION iniciar_sessao_estudo(
  p_user_id UUID,
  p_assunto_id UUID
) RETURNS UUID AS $$
DECLARE
  v_sessao_id UUID;
BEGIN
  INSERT INTO sessoes_estudo (user_id, assunto_id, inicio)
  VALUES (p_user_id, p_assunto_id, NOW())
  RETURNING id INTO v_sessao_id;
  
  RETURN v_sessao_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Finalizar sessão de estudo
CREATE OR REPLACE FUNCTION finalizar_sessao_estudo(
  p_sessao_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE sessoes_estudo
  SET fim = NOW()
  WHERE id = p_sessao_id AND fim IS NULL;
END;
$$ LANGUAGE plpgsql;
