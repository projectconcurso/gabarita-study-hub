-- Sistema de XP e Níveis
-- Data: 2026-04-01
-- Regras: 1 XP por simulado concluído, 2 XP por apostila lida
-- Cada 10 XP = 1 nível (máximo nível 100 = 1000 XP)

-- Tabela de XP do usuário
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  nivel INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de histórico de XP (registro de cada ação)
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_ganho INTEGER NOT NULL,
  acao VARCHAR(50) NOT NULL, -- 'simulado_concluido', 'apostila_lida'
  referencia_id UUID, -- ID do simulado ou apostila
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON xp_history(created_at DESC);

-- Função: Calcular nível baseado em XP
CREATE OR REPLACE FUNCTION calcular_nivel(p_total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Cada 10 XP = 1 nível, máximo nível 100
  RETURN LEAST(FLOOR(p_total_xp / 10), 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função: Adicionar XP ao usuário
CREATE OR REPLACE FUNCTION adicionar_xp(
  p_user_id UUID,
  p_xp_ganho INTEGER,
  p_acao VARCHAR(50),
  p_referencia_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_total_xp_anterior INTEGER;
  v_total_xp_novo INTEGER;
  v_nivel_anterior INTEGER;
  v_nivel_novo INTEGER;
  v_subiu_nivel BOOLEAN;
BEGIN
  -- Inserir ou atualizar XP do usuário
  INSERT INTO user_xp (user_id, total_xp, nivel)
  VALUES (p_user_id, p_xp_ganho, calcular_nivel(p_xp_ganho))
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_xp = user_xp.total_xp + p_xp_ganho,
    nivel = calcular_nivel(user_xp.total_xp + p_xp_ganho),
    updated_at = NOW()
  RETURNING 
    total_xp - p_xp_ganho,
    total_xp,
    calcular_nivel(total_xp - p_xp_ganho),
    nivel
  INTO v_total_xp_anterior, v_total_xp_novo, v_nivel_anterior, v_nivel_novo;

  -- Se não encontrou (primeira vez), buscar valores
  IF NOT FOUND THEN
    SELECT total_xp, nivel INTO v_total_xp_novo, v_nivel_novo
    FROM user_xp WHERE user_id = p_user_id;
    v_total_xp_anterior := v_total_xp_novo - p_xp_ganho;
    v_nivel_anterior := calcular_nivel(v_total_xp_anterior);
  END IF;

  -- Registrar no histórico
  INSERT INTO xp_history (user_id, xp_ganho, acao, referencia_id)
  VALUES (p_user_id, p_xp_ganho, p_acao, p_referencia_id);

  -- Verificar se subiu de nível
  v_subiu_nivel := v_nivel_novo > v_nivel_anterior;

  -- Retornar resultado
  RETURN jsonb_build_object(
    'xp_anterior', v_total_xp_anterior,
    'xp_ganho', p_xp_ganho,
    'xp_novo', v_total_xp_novo,
    'nivel_anterior', v_nivel_anterior,
    'nivel_novo', v_nivel_novo,
    'subiu_nivel', v_subiu_nivel
  );
END;
$$ LANGUAGE plpgsql;

-- Função: Buscar XP do usuário
CREATE OR REPLACE FUNCTION buscar_xp_usuario(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_xp', COALESCE(total_xp, 0),
    'nivel', COALESCE(nivel, 0),
    'xp_para_proximo_nivel', 10 - (COALESCE(total_xp, 0) % 10),
    'progresso_nivel', (COALESCE(total_xp, 0) % 10) * 10
  )
  INTO v_result
  FROM user_xp
  WHERE user_id = p_user_id;

  -- Se não existe registro, retornar valores padrão
  IF v_result IS NULL THEN
    v_result := jsonb_build_object(
      'total_xp', 0,
      'nivel', 0,
      'xp_para_proximo_nivel', 10,
      'progresso_nivel', 0
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Dar XP ao concluir simulado
CREATE OR REPLACE FUNCTION trigger_xp_simulado_concluido()
RETURNS TRIGGER AS $$
BEGIN
  -- Só dar XP se o status mudou para 'concluido'
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    PERFORM adicionar_xp(NEW.user_id, 1, 'simulado_concluido', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER simulado_concluido_xp
AFTER UPDATE ON simulados
FOR EACH ROW
EXECUTE FUNCTION trigger_xp_simulado_concluido();

-- Trigger: Dar XP ao ler apostila (via progresso_estudos)
CREATE OR REPLACE FUNCTION trigger_xp_apostila_lida()
RETURNS TRIGGER AS $$
BEGIN
  -- Só dar XP se apostila_lida mudou de false para true
  IF NEW.apostila_lida = true AND (OLD.apostila_lida IS NULL OR OLD.apostila_lida = false) THEN
    PERFORM adicionar_xp(NEW.user_id, 2, 'apostila_lida', NEW.assunto_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apostila_lida_xp
AFTER UPDATE ON progresso_estudos
FOR EACH ROW
EXECUTE FUNCTION trigger_xp_apostila_lida();

-- RLS (Row Level Security)
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para user_xp
CREATE POLICY "Usuários podem ver seu próprio XP"
  ON user_xp FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir/atualizar XP"
  ON user_xp FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas de segurança para xp_history
CREATE POLICY "Usuários podem ver seu próprio histórico"
  ON xp_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir histórico"
  ON xp_history FOR INSERT
  WITH CHECK (true);

-- Comentários
COMMENT ON TABLE user_xp IS 'Armazena XP total e nível de cada usuário';
COMMENT ON TABLE xp_history IS 'Histórico de todas as ações que geraram XP';
COMMENT ON FUNCTION adicionar_xp IS 'Adiciona XP ao usuário e retorna informações sobre mudança de nível';
COMMENT ON FUNCTION buscar_xp_usuario IS 'Retorna XP, nível e progresso do usuário';
COMMENT ON FUNCTION calcular_nivel IS 'Calcula nível baseado em XP total (10 XP = 1 nível, máx 100)';
