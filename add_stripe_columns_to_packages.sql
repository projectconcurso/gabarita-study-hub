-- Adicionar colunas do Stripe na tabela gabaritos_packages

ALTER TABLE gabaritos_packages 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_gabaritos_packages_stripe_price_id 
ON gabaritos_packages(stripe_price_id);

-- Atualizar pacotes com os IDs do Stripe

-- Pacote 100 Gabaritos
UPDATE gabaritos_packages 
SET 
  stripe_price_id = 'price_1TD6Zs9b0w6EXzYIvuw3eCfo',
  stripe_product_id = 'prod_UBTWywflQx3aQQ'
WHERE amount = 100;

-- Pacote 300 Gabaritos
UPDATE gabaritos_packages 
SET 
  stripe_price_id = 'price_1TD6b09b0w6EXzYIPfRgqyHw',
  stripe_product_id = 'prod_UBTYcRMCJwPZCq'
WHERE amount = 300;

-- Pacote 500 Gabaritos
UPDATE gabaritos_packages 
SET 
  stripe_price_id = 'price_1TD6d79b0w6EXzYI6ydTZdY0',
  stripe_product_id = 'prod_UBTaYoVZMHnnem'
WHERE amount = 500;

-- Verificar resultado
SELECT 
  id, 
  name, 
  amount, 
  price_brl, 
  stripe_price_id, 
  stripe_product_id,
  active
FROM gabaritos_packages 
ORDER BY amount;
