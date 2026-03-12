DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'comentarios_mural'
      AND column_name = 'comentario'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'comentarios_mural'
      AND column_name = 'conteudo'
  ) THEN
    ALTER TABLE public.comentarios_mural RENAME COLUMN comentario TO conteudo;
  END IF;
END $$;

ALTER TABLE public.comentarios_mural
ADD COLUMN IF NOT EXISTS conteudo text;

UPDATE public.comentarios_mural
SET conteudo = ''
WHERE conteudo IS NULL;

ALTER TABLE public.comentarios_mural
ALTER COLUMN conteudo SET NOT NULL;
