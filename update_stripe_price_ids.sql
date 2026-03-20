-- Atualizar pacotes de Gabaritos com os Price IDs do Stripe

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

-- Verificar se foi atualizado corretamente
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
