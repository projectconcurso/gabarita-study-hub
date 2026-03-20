-- Atualizar pacote de 100 Gabaritos com novo Price ID (R$ 0,00 para teste)

UPDATE gabaritos_packages 
SET 
  stripe_price_id = 'price_1TD8aR9b0w6EXzYIZ2L2vtVo',
  stripe_product_id = 'prod_UBVbHnS9fawWJb'
WHERE amount = 100;

-- Verificar atualização
SELECT 
  id, 
  name, 
  amount, 
  price_brl,
  stripe_price_id, 
  stripe_product_id,
  active
FROM gabaritos_packages 
WHERE amount = 100;
