ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own simulados" ON public.simulados;
DROP POLICY IF EXISTS "Users can view concluded simulados from accepted friends" ON public.simulados;

CREATE POLICY "Users can view own simulados"
ON public.simulados
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view concluded simulados from accepted friends"
ON public.simulados
FOR SELECT
TO authenticated
USING (
  status = 'concluido'
  AND EXISTS (
    SELECT 1
    FROM public.amizades
    WHERE status = 'aceito'
      AND (
        (user_id = auth.uid() AND amigo_id = public.simulados.user_id)
        OR (amigo_id = auth.uid() AND user_id = public.simulados.user_id)
      )
  )
);
