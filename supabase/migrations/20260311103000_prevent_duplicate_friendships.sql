DELETE FROM public.amizades a
USING public.amizades b
WHERE a.id > b.id
  AND LEAST(a.user_id, a.amigo_id) = LEAST(b.user_id, b.amigo_id)
  AND GREATEST(a.user_id, a.amigo_id) = GREATEST(b.user_id, b.amigo_id);

CREATE UNIQUE INDEX IF NOT EXISTS amizades_unique_pair_idx
ON public.amizades (LEAST(user_id, amigo_id), GREATEST(user_id, amigo_id));
