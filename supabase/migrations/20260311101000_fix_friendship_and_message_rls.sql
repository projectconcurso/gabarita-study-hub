ALTER TABLE public.amizades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own friendships" ON public.amizades;
DROP POLICY IF EXISTS "Users can insert friendship requests" ON public.amizades;
DROP POLICY IF EXISTS "Users can update received friendship requests" ON public.amizades;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.mensagens;
DROP POLICY IF EXISTS "Users can send messages to friends" ON public.mensagens;
DROP POLICY IF EXISTS "Users can update read status of received messages" ON public.mensagens;

CREATE POLICY "Users can view their own friendships"
ON public.amizades
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = amigo_id);

CREATE POLICY "Users can insert friendship requests"
ON public.amizades
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND user_id <> amigo_id
);

CREATE POLICY "Users can update received friendship requests"
ON public.amizades
FOR UPDATE
TO authenticated
USING (auth.uid() = amigo_id OR auth.uid() = user_id)
WITH CHECK (auth.uid() = amigo_id OR auth.uid() = user_id);

CREATE POLICY "Users can view their own messages"
ON public.mensagens
FOR SELECT
TO authenticated
USING (auth.uid() = remetente_id OR auth.uid() = destinatario_id);

CREATE POLICY "Users can send messages to friends"
ON public.mensagens
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = remetente_id
  AND EXISTS (
    SELECT 1
    FROM public.amizades
    WHERE status = 'aceito'
      AND (
        (user_id = remetente_id AND amigo_id = destinatario_id)
        OR (user_id = destinatario_id AND amigo_id = remetente_id)
      )
  )
);

CREATE POLICY "Users can update read status of received messages"
ON public.mensagens
FOR UPDATE
TO authenticated
USING (auth.uid() = destinatario_id)
WITH CHECK (auth.uid() = destinatario_id);
