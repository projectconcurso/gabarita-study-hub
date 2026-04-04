-- Sistema Meus Estudos - Row Level Security (RLS)
-- Data: 2026-03-26

-- Habilitar RLS em todas as tabelas
ALTER TABLE concursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias_concurso ENABLE ROW LEVEL SECURITY;
ALTER TABLE assuntos_materia ENABLE ROW LEVEL SECURITY;
ALTER TABLE apostilas ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_estudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_estudo ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: CONCURSOS
-- =====================================================

CREATE POLICY "Usuários podem ver seus próprios concursos"
  ON concursos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios concursos"
  ON concursos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios concursos"
  ON concursos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios concursos"
  ON concursos FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: MATÉRIAS
-- =====================================================

CREATE POLICY "Usuários podem ver matérias de seus concursos"
  ON materias_concurso FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM concursos
      WHERE concursos.id = materias_concurso.concurso_id
      AND concursos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar matérias em seus concursos"
  ON materias_concurso FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM concursos
      WHERE concursos.id = materias_concurso.concurso_id
      AND concursos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar matérias de seus concursos"
  ON materias_concurso FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM concursos
      WHERE concursos.id = materias_concurso.concurso_id
      AND concursos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar matérias de seus concursos"
  ON materias_concurso FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM concursos
      WHERE concursos.id = materias_concurso.concurso_id
      AND concursos.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLICIES: ASSUNTOS
-- =====================================================

CREATE POLICY "Usuários podem ver assuntos de suas matérias"
  ON assuntos_materia FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM materias_concurso mc
      JOIN concursos c ON c.id = mc.concurso_id
      WHERE mc.id = assuntos_materia.materia_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar assuntos em suas matérias"
  ON assuntos_materia FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM materias_concurso mc
      JOIN concursos c ON c.id = mc.concurso_id
      WHERE mc.id = assuntos_materia.materia_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar assuntos de suas matérias"
  ON assuntos_materia FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM materias_concurso mc
      JOIN concursos c ON c.id = mc.concurso_id
      WHERE mc.id = assuntos_materia.materia_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar assuntos de suas matérias"
  ON assuntos_materia FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM materias_concurso mc
      JOIN concursos c ON c.id = mc.concurso_id
      WHERE mc.id = assuntos_materia.materia_id
      AND c.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLICIES: APOSTILAS
-- =====================================================

CREATE POLICY "Usuários podem ver apostilas de seus assuntos"
  ON apostilas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assuntos_materia am
      JOIN materias_concurso mc ON mc.id = am.materia_id
      JOIN concursos c ON c.id = mc.concurso_id
      WHERE am.id = apostilas.assunto_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar apostilas em seus assuntos"
  ON apostilas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assuntos_materia am
      JOIN materias_concurso mc ON mc.id = am.materia_id
      JOIN concursos c ON c.id = mc.concurso_id
      WHERE am.id = apostilas.assunto_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar apostilas de seus assuntos"
  ON apostilas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assuntos_materia am
      JOIN materias_concurso mc ON mc.id = am.materia_id
      JOIN concursos c ON c.id = mc.concurso_id
      WHERE am.id = apostilas.assunto_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar apostilas de seus assuntos"
  ON apostilas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assuntos_materia am
      JOIN materias_concurso mc ON mc.id = am.materia_id
      JOIN concursos c ON c.id = mc.concurso_id
      WHERE am.id = apostilas.assunto_id
      AND c.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLICIES: PROGRESSO DE ESTUDOS
-- =====================================================

CREATE POLICY "Usuários podem ver seu próprio progresso"
  ON progresso_estudos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seu próprio progresso"
  ON progresso_estudos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso"
  ON progresso_estudos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seu próprio progresso"
  ON progresso_estudos FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: SESSÕES DE ESTUDO
-- =====================================================

CREATE POLICY "Usuários podem ver suas próprias sessões"
  ON sessoes_estudo FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias sessões"
  ON sessoes_estudo FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias sessões"
  ON sessoes_estudo FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias sessões"
  ON sessoes_estudo FOR DELETE
  USING (auth.uid() = user_id);
