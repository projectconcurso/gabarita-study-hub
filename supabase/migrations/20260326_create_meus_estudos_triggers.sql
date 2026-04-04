/* Sistema Meus Estudos - Triggers */
/* Data: 2026-03-26 */

/* Trigger: Atualizar updated_at em concursos */
CREATE OR REPLACE FUNCTION update_concurso_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_concurso_updated_at
  BEFORE UPDATE ON concursos
  FOR EACH ROW
  EXECUTE FUNCTION update_concurso_updated_at();

/* Trigger: Atualizar updated_at em progresso_estudos */
CREATE OR REPLACE FUNCTION update_progresso_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progresso_updated_at
  BEFORE UPDATE ON progresso_estudos
  FOR EACH ROW
  EXECUTE FUNCTION update_progresso_updated_at();

/* Trigger: Calcular duração ao finalizar sessão de estudo */
CREATE OR REPLACE FUNCTION calcular_duracao_sessao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fim IS NOT NULL AND (OLD.fim IS NULL OR OLD.fim IS DISTINCT FROM NEW.fim) THEN
    NEW.duracao_segundos = EXTRACT(EPOCH FROM (NEW.fim - NEW.inicio))::INTEGER;
    
    /* Atualizar tempo total de estudo no progresso */
    UPDATE progresso_estudos
    SET tempo_estudo_segundos = tempo_estudo_segundos + NEW.duracao_segundos
    WHERE user_id = NEW.user_id AND assunto_id = NEW.assunto_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_duracao_sessao
  BEFORE UPDATE ON sessoes_estudo
  FOR EACH ROW
  EXECUTE FUNCTION calcular_duracao_sessao();

/* Trigger: Atualizar progresso quando simulado é concluído */
CREATE OR REPLACE FUNCTION atualizar_progresso_ao_concluir_simulado()
RETURNS TRIGGER AS $$
BEGIN
  /* Só atualizar se o simulado está vinculado a um assunto e foi concluído */
  IF NEW.assunto_id IS NOT NULL AND NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    /* Garantir que existe registro de progresso */
    PERFORM inicializar_progresso_assunto(NEW.user_id, NEW.assunto_id);
    
    /* Incrementar contador de simulados concluídos */
    UPDATE progresso_estudos
    SET simulados_concluidos = simulados_concluidos + 1
    WHERE user_id = NEW.user_id AND assunto_id = NEW.assunto_id;
    
    /* Atualizar percentual de conclusão */
    PERFORM atualizar_progresso_assunto(NEW.user_id, NEW.assunto_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_progresso_simulado
  AFTER UPDATE ON simulados
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_progresso_ao_concluir_simulado();

/* Trigger: Inicializar progresso ao criar assunto */
CREATE OR REPLACE FUNCTION inicializar_progresso_ao_criar_assunto()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  /* Buscar user_id do concurso */
  SELECT c.user_id INTO v_user_id
  FROM materias_concurso mc
  JOIN concursos c ON c.id = mc.concurso_id
  WHERE mc.id = NEW.materia_id;
  
  /* Inicializar progresso para o usuário */
  IF v_user_id IS NOT NULL THEN
    PERFORM inicializar_progresso_assunto(v_user_id, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inicializar_progresso_assunto
  AFTER INSERT ON assuntos_materia
  FOR EACH ROW
  EXECUTE FUNCTION inicializar_progresso_ao_criar_assunto();
