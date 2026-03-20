-- Adicionar campos de Gabaritos na tabela de usuários
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS gabaritos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gabaritos_premium_reset_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_gabaritos_granted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE;

-- Criar tabela de transações de Gabaritos
CREATE TABLE IF NOT EXISTS public.gabaritos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'deduction', 'premium_grant', 'trial_grant', 'refund')),
  description TEXT,
  simulado_id UUID REFERENCES public.simulados(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_gabaritos_transactions_user_id ON public.gabaritos_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gabaritos_transactions_created_at ON public.gabaritos_transactions(created_at);

-- Criar tabela de pacotes de Gabaritos disponíveis para compra
CREATE TABLE IF NOT EXISTS public.gabaritos_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  price_brl DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir pacotes padrão
INSERT INTO public.gabaritos_packages (name, amount, price_brl) VALUES
  ('Pacote 100', 100, 49.90),
  ('Pacote 300', 300, 69.90),
  ('Pacote 500', 500, 89.90)
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.gabaritos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gabaritos_packages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para gabaritos_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.gabaritos_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.gabaritos_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para gabaritos_packages
CREATE POLICY "Anyone can view active packages"
  ON public.gabaritos_packages
  FOR SELECT
  USING (active = TRUE);

-- Função para calcular custo de simulado baseado na quantidade de questões
CREATE OR REPLACE FUNCTION public.calculate_simulado_cost(questoes_count INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF questoes_count <= 0 OR questoes_count > 80 THEN
    RAISE EXCEPTION 'Número de questões deve estar entre 1 e 80';
  END IF;
  
  IF questoes_count >= 5 AND questoes_count <= 20 THEN
    RETURN 5;
  ELSIF questoes_count >= 21 AND questoes_count <= 40 THEN
    RETURN 10;
  ELSIF questoes_count >= 41 AND questoes_count <= 60 THEN
    RETURN 15;
  ELSIF questoes_count >= 61 AND questoes_count <= 80 THEN
    RETURN 20;
  ELSE
    RETURN 5; -- Menos de 5 questões também custa 5
  END IF;
END;
$$;

-- Função para deduzir Gabaritos ao criar simulado
CREATE OR REPLACE FUNCTION public.deduct_gabaritos_for_simulado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  custo INTEGER;
  saldo_atual INTEGER;
BEGIN
  -- Calcular custo baseado no total de questões
  custo := public.calculate_simulado_cost(NEW.total_questoes);
  
  -- Obter saldo atual do usuário
  SELECT COALESCE(gabaritos, 0) INTO saldo_atual
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Verificar se tem saldo suficiente
  IF saldo_atual < custo THEN
    RAISE EXCEPTION 'Saldo insuficiente de Gabaritos. Necessário: %, Disponível: %', custo, saldo_atual;
  END IF;
  
  -- Deduzir Gabaritos
  UPDATE auth.users
  SET gabaritos = gabaritos - custo
  WHERE id = NEW.user_id;
  
  -- Registrar transação
  INSERT INTO public.gabaritos_transactions (user_id, amount, type, description, simulado_id)
  VALUES (NEW.user_id, -custo, 'deduction', 
          format('Simulado: %s questões', NEW.total_questoes), 
          NEW.id);
  
  RETURN NEW;
END;
$$;

-- Criar trigger para deduzir Gabaritos ao criar simulado
DROP TRIGGER IF EXISTS trigger_deduct_gabaritos ON public.simulados;
CREATE TRIGGER trigger_deduct_gabaritos
  AFTER INSERT ON public.simulados
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_gabaritos_for_simulado();

-- Função para conceder Gabaritos de trial
CREATE OR REPLACE FUNCTION public.grant_trial_gabaritos(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  already_granted BOOLEAN;
BEGIN
  -- Verificar se já foi concedido
  SELECT COALESCE(trial_gabaritos_granted, FALSE) INTO already_granted
  FROM auth.users
  WHERE id = p_user_id;
  
  IF already_granted THEN
    RETURN FALSE;
  END IF;
  
  -- Conceder 50 Gabaritos de trial
  UPDATE auth.users
  SET gabaritos = gabaritos + 50,
      trial_gabaritos_granted = TRUE,
      trial_started_at = NOW()
  WHERE id = p_user_id;
  
  -- Registrar transação
  INSERT INTO public.gabaritos_transactions (user_id, amount, type, description)
  VALUES (p_user_id, 50, 'trial_grant', 'Gabaritos de trial (3 dias)');
  
  RETURN TRUE;
END;
$$;

-- Função para resetar Gabaritos Premium mensalmente
CREATE OR REPLACE FUNCTION public.reset_premium_gabaritos(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_reset TIMESTAMP WITH TIME ZONE;
  is_premium BOOLEAN;
BEGIN
  -- Verificar se usuário é premium
  SELECT subscription_status = 'active' INTO is_premium
  FROM auth.users
  WHERE id = p_user_id;
  
  IF NOT is_premium THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar último reset
  SELECT gabaritos_premium_reset_at INTO last_reset
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Se nunca resetou ou passou 1 mês
  IF last_reset IS NULL OR (NOW() - last_reset) > INTERVAL '30 days' THEN
    -- Resetar para 500 Gabaritos (não acumula)
    UPDATE auth.users
    SET gabaritos = 500,
        gabaritos_premium_reset_at = NOW()
    WHERE id = p_user_id;
    
    -- Registrar transação
    INSERT INTO public.gabaritos_transactions (user_id, amount, type, description)
    VALUES (p_user_id, 500, 'premium_grant', 'Reset mensal Premium (500 Gabaritos)');
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Função para adicionar Gabaritos (compra de pacote)
CREATE OR REPLACE FUNCTION public.add_gabaritos(p_user_id UUID, p_amount INTEGER, p_description TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Adicionar Gabaritos
  UPDATE auth.users
  SET gabaritos = gabaritos + p_amount
  WHERE id = p_user_id;
  
  -- Registrar transação
  INSERT INTO public.gabaritos_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'purchase', p_description);
  
  RETURN TRUE;
END;
$$;

COMMENT ON TABLE public.gabaritos_transactions IS 'Histórico de transações de Gabaritos (moeda virtual)';
COMMENT ON TABLE public.gabaritos_packages IS 'Pacotes de Gabaritos disponíveis para compra';
COMMENT ON FUNCTION public.calculate_simulado_cost IS 'Calcula custo em Gabaritos baseado na quantidade de questões';
COMMENT ON FUNCTION public.deduct_gabaritos_for_simulado IS 'Deduz Gabaritos automaticamente ao criar simulado';
COMMENT ON FUNCTION public.grant_trial_gabaritos IS 'Concede 50 Gabaritos de trial (uma vez por usuário)';
COMMENT ON FUNCTION public.reset_premium_gabaritos IS 'Reseta Gabaritos Premium para 500 mensalmente';
COMMENT ON FUNCTION public.add_gabaritos IS 'Adiciona Gabaritos ao saldo do usuário (compra)';
