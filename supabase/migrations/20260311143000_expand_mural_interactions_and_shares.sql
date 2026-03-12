ALTER TABLE public.posts_mural
ADD COLUMN IF NOT EXISTS simulado_id uuid REFERENCES public.simulados(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.comentarios_mural (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts_mural(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conteudo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.posts_mural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reacoes_mural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_mural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view mural posts" ON public.posts_mural;
CREATE POLICY "Authenticated users can view mural posts"
ON public.posts_mural
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create mural posts" ON public.posts_mural;
CREATE POLICY "Authenticated users can create mural posts"
ON public.posts_mural
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view mural reactions" ON public.reacoes_mural;
CREATE POLICY "Authenticated users can view mural reactions"
ON public.reacoes_mural
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create mural reactions" ON public.reacoes_mural;
CREATE POLICY "Authenticated users can create mural reactions"
ON public.reacoes_mural
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can delete own mural reactions" ON public.reacoes_mural;
CREATE POLICY "Authenticated users can delete own mural reactions"
ON public.reacoes_mural
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view mural comments" ON public.comentarios_mural;
CREATE POLICY "Authenticated users can view mural comments"
ON public.comentarios_mural
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create mural comments" ON public.comentarios_mural;
CREATE POLICY "Authenticated users can create mural comments"
ON public.comentarios_mural
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can delete own mural comments" ON public.comentarios_mural;
CREATE POLICY "Authenticated users can delete own mural comments"
ON public.comentarios_mural
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view shared simulados from mural" ON public.simulados;
CREATE POLICY "Authenticated users can view shared simulados from mural"
ON public.simulados
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.posts_mural
    WHERE posts_mural.simulado_id = public.simulados.id
  )
);

DROP POLICY IF EXISTS "Authenticated users can view questions from shared simulados in mural" ON public.questoes;
CREATE POLICY "Authenticated users can view questions from shared simulados in mural"
ON public.questoes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.posts_mural
    WHERE posts_mural.simulado_id = public.questoes.simulado_id
  )
);

CREATE INDEX IF NOT EXISTS idx_posts_mural_simulado_id ON public.posts_mural(simulado_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_mural_post_id ON public.comentarios_mural(post_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_mural_created_at ON public.comentarios_mural(created_at DESC);
