ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts_mural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amizades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can delete own simulados" ON public.simulados;
CREATE POLICY "Users can delete own simulados"
ON public.simulados
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can delete own mural posts" ON public.posts_mural;
CREATE POLICY "Authenticated users can delete own mural posts"
ON public.posts_mural
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own friendships" ON public.amizades;
CREATE POLICY "Users can delete own friendships"
ON public.amizades
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = amigo_id);
