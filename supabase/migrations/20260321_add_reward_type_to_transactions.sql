-- Adicionar tipo 'reward' à constraint de gabaritos_transactions

-- Remover constraint antiga
ALTER TABLE public.gabaritos_transactions 
DROP CONSTRAINT IF EXISTS gabaritos_transactions_type_check;

-- Adicionar constraint nova com 'reward'
ALTER TABLE public.gabaritos_transactions 
ADD CONSTRAINT gabaritos_transactions_type_check 
CHECK (type IN ('purchase', 'deduction', 'premium_grant', 'trial_grant', 'refund', 'reward'));
