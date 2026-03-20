-- Add image_url column to questoes table to store generated image URLs
ALTER TABLE questoes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN questoes.image_url IS 'URL of generated image for visual elements in the question (charts, graphs, images, etc.)';
