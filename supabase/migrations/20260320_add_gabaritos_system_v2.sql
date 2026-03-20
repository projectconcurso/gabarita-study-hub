-- Criar tabela de saldo de Gabaritos (separada de auth.users)
CREATE TABLE IF NOT EXISTS public.user_gabaritos (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gabaritos INTEGER DEFAULT 0 NOT NULL,
  trial_gabaritos_granted BOOLEAN DEFAULT FALSE,
  trial_started_at TIMESTAMP WITH TIME ZONE,
  premium_reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_gabaritos_user_id ON public.user_gabaritos(user_id);
CREATE INDEX IF NOT EXISTS idx_gabaritos_transactions_user_id ON public.gabaritos_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gabaritos_transactions_created_at ON public.gabaritos_transactions(created_at);

-- Habilitar RLS
ALTER TABLE public.user_gabaritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gabaritos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gabaritos_packages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_gabaritos
CREATE POLICY "Users can view their own gabaritos"
  ON public.user_gabaritos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gabaritos"
  ON public.user_gabaritos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gabaritos"
  ON public.user_gabaritos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

-- Função para inicializar saldo de Gabaritos para novo usuário
CREATE OR REPLACE FUNCTION public.initialize_user_gabaritos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_gabaritos (user_id, gabaritos)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger para inicializar saldo ao criar usuário
DROP TRIGGER IF EXISTS trigger_initialize_gabaritos ON auth.users;
CREATE TRIGGER trigger_initialize_gabaritos
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_gabaritos();

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
    RETURN 5;
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
  FROM public.user_gabaritos
  WHERE user_id = NEW.user_id;
  
  -- Se não existe registro, criar com saldo 0
  IF NOT FOUND THEN
    INSERT INTO public.user_gabaritos (user_id, gabaritos)
    VALUES (NEW.user_id, 0);
    saldo_atual := 0;
  END IF;
  
  -- Verificar se tem saldo suficiente
  IF saldo_atual < custo THEN
    RAISE EXCEPTION 'Saldo insuficiente de Gabaritos. Necessário: %, Disponível: %', custo, saldo_atual;
  END IF;
  
  -- Deduzir Gabaritos
  UPDATE public.user_gabaritos
  SET gabaritos = gabaritos - custo,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
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
  FROM public.user_gabaritos
  WHERE user_id = p_user_id;
  
  IF already_granted THEN
    RETURN FALSE;
  END IF;
  
  -- Se não existe registro, criar
  INSERT INTO public.user_gabaritos (user_id, gabaritos, trial_gabaritos_granted, trial_started_at)
  VALUES (p_user_id, 50, TRUE, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET gabaritos = public.user_gabaritos.gabaritos + 50,
      trial_gabaritos_granted = TRUE,
      trial_started_at = NOW(),
      updated_at = NOW();
  
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
  -- Verificar se usuário é premium (você precisará ajustar isso conforme seu sistema de assinatura)
  -- Por enquanto, assumindo que existe um campo subscription_status
  SELECT subscription_status = 'active' INTO is_premium
  FROM auth.users
  WHERE id = p_user_id;
  
  IF NOT is_premium THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar último reset
  SELECT premium_reset_at INTO last_reset
  FROM public.user_gabaritos
  WHERE user_id = p_user_id;
  
  -- Se nunca resetou ou passou 1 mês
  IF last_reset IS NULL OR (NOW() - last_reset) > INTERVAL '30 days' THEN
    -- Resetar para 500 Gabaritos (não acumula)
    INSERT INTO public.user_gabaritos (user_id, gabaritos, premium_reset_at)
    VALUES (p_user_id, 500, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET gabaritos = 500,
        premium_reset_at = NOW(),
        updated_at = NOW();
    
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
  INSERT INTO public.user_gabaritos (user_id, gabaritos)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET gabaritos = public.user_gabaritos.gabaritos + p_amount,
      updated_at = NOW();
  
  -- Registrar transação
  INSERT INTO public.gabaritos_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'purchase', p_description);
  
  RETURN TRUE;
END;
$$;

-- Função para obter saldo de Gabaritos
CREATE OR REPLACE FUNCTION public.get_gabaritos_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance INTEGER;
BEGIN
  SELECT COALESCE(gabaritos, 0) INTO balance
  FROM public.user_gabaritos
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Criar registro se não existe
    INSERT INTO public.user_gabaritos (user_id, gabaritos)
    VALUES (p_user_id, 0);
    RETURN 0;
  END IF;
  
  RETURN balance;
END;
$$;

COMMENT ON TABLE public.user_gabaritos IS 'Saldo de Gabaritos por usuário';
COMMENT ON TABLE public.gabaritos_transactions IS 'Histórico de transações de Gabaritos (moeda virtual)';
COMMENT ON TABLE public.gabaritos_packages IS 'Pacotes de Gabaritos disponíveis para compra';
COMMENT ON FUNCTION public.calculate_simulado_cost IS 'Calcula custo em Gabaritos baseado na quantidade de questões';
COMMENT ON FUNCTION public.deduct_gabaritos_for_simulado IS 'Deduz Gabaritos automaticamente ao criar simulado';
COMMENT ON FUNCTION public.grant_trial_gabaritos IS 'Concede 50 Gabaritos de trial (uma vez por usuário)';
COMMENT ON FUNCTION public.reset_premium_gabaritos IS 'Reseta Gabaritos Premium para 500 mensalmente';
COMMENT ON FUNCTION public.add_gabaritos IS 'Adiciona Gabaritos ao saldo do usuário (compra)';
COMMENT ON FUNCTION public.get_gabaritos_balance IS 'Obtém saldo atual de Gabaritos do usuário';
