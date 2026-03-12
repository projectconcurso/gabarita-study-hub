ALTER TABLE public.amizades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can delete own friendships" ON public.amizades;
CREATE POLICY "Users can delete own friendships"
ON public.amizades
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = amigo_id);
