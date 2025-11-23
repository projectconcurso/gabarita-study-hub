-- Tabela de simulados
CREATE TABLE public.simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tema TEXT NOT NULL,
  materia TEXT NOT NULL,
  total_questoes INTEGER NOT NULL,
  acertos INTEGER NOT NULL DEFAULT 0,
  tempo_gasto INTEGER, -- em segundos
  percentual_acerto DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'em_andamento', -- em_andamento, concluido
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de questões dos simulados
CREATE TABLE public.questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id UUID REFERENCES public.simulados(id) ON DELETE CASCADE NOT NULL,
  enunciado TEXT NOT NULL,
  alternativas JSONB NOT NULL, -- array de {letra, texto}
  resposta_correta TEXT NOT NULL,
  resposta_usuario TEXT,
  explicacao TEXT,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de amizades
CREATE TABLE public.amizades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amigo_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, aceito, recusado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, amigo_id)
);

-- Tabela de mensagens do chat
CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remetente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destinatario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de posts do mural
CREATE TABLE public.posts_mural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  simulado_id UUID REFERENCES public.simulados(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'resultado', -- resultado, conquista, comentario
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de comentários nos posts
CREATE TABLE public.comentarios_mural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts_mural(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comentario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de reações nos posts
CREATE TABLE public.reacoes_mural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts_mural(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL, -- motivado, parabens, fogo, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amizades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts_mural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_mural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reacoes_mural ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para simulados
CREATE POLICY "Usuários podem ver seus próprios simulados"
  ON public.simulados FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios simulados"
  ON public.simulados FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios simulados"
  ON public.simulados FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para questões
CREATE POLICY "Usuários podem ver questões dos seus simulados"
  ON public.questoes FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.simulados 
    WHERE simulados.id = questoes.simulado_id 
    AND simulados.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem inserir questões nos seus simulados"
  ON public.questoes FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.simulados 
    WHERE simulados.id = questoes.simulado_id 
    AND simulados.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar questões dos seus simulados"
  ON public.questoes FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.simulados 
    WHERE simulados.id = questoes.simulado_id 
    AND simulados.user_id = auth.uid()
  ));

-- Políticas RLS para amizades
CREATE POLICY "Usuários podem ver suas amizades"
  ON public.amizades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = amigo_id);

CREATE POLICY "Usuários podem criar solicitações de amizade"
  ON public.amizades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar solicitações recebidas"
  ON public.amizades FOR UPDATE
  TO authenticated
  USING (auth.uid() = amigo_id);

-- Políticas RLS para mensagens
CREATE POLICY "Usuários podem ver suas mensagens"
  ON public.mensagens FOR SELECT
  TO authenticated
  USING (auth.uid() = remetente_id OR auth.uid() = destinatario_id);

CREATE POLICY "Usuários podem enviar mensagens"
  ON public.mensagens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = remetente_id);

CREATE POLICY "Usuários podem atualizar mensagens recebidas"
  ON public.mensagens FOR UPDATE
  TO authenticated
  USING (auth.uid() = destinatario_id);

-- Políticas RLS para posts do mural (amigos podem ver)
CREATE POLICY "Usuários podem ver posts de amigos"
  ON public.posts_mural FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.amizades 
      WHERE (
        (amizades.user_id = auth.uid() AND amizades.amigo_id = posts_mural.user_id) OR
        (amizades.amigo_id = auth.uid() AND amizades.user_id = posts_mural.user_id)
      ) AND amizades.status = 'aceito'
    )
  );

CREATE POLICY "Usuários podem criar seus posts"
  ON public.posts_mural FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para comentários
CREATE POLICY "Usuários podem ver comentários de posts visíveis"
  ON public.comentarios_mural FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.posts_mural 
    WHERE posts_mural.id = comentarios_mural.post_id
  ));

CREATE POLICY "Usuários podem comentar em posts visíveis"
  ON public.comentarios_mural FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para reações
CREATE POLICY "Usuários podem ver reações de posts visíveis"
  ON public.reacoes_mural FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.posts_mural 
    WHERE posts_mural.id = reacoes_mural.post_id
  ));

CREATE POLICY "Usuários podem reagir em posts visíveis"
  ON public.reacoes_mural FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas reações"
  ON public.reacoes_mural FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em amizades
CREATE TRIGGER update_amizades_updated_at
  BEFORE UPDATE ON public.amizades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para chat e mural
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts_mural;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comentarios_mural;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reacoes_mural;