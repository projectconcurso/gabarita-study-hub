-- Corrige problema de desconto de gabaritos antes da criação bem-sucedida do simulado
-- Data: 2026-04-04

-- Desabilitar trigger que desconta gabaritos automaticamente ao inserir simulado
DROP TRIGGER IF EXISTS trigger_deduct_gabaritos ON public.simulados;

-- A função deduct_gabaritos_for_simulado ainda existe mas não será mais chamada automaticamente
-- Ela será chamada manualmente pela edge function após a geração bem-sucedida das questões

-- Criar nova função para descontar gabaritos manualmente (chamada pela edge function)
CREATE OR REPLACE FUNCTION public.deduct_gabaritos_manual(
  p_user_id UUID,
  p_simulado_id UUID,
  p_total_questoes INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  custo INTEGER;
  saldo_atual INTEGER;
BEGIN
  -- Calcular custo (2 Gabaritos por questão)
  custo := p_total_questoes * 2;
  
  -- Buscar saldo atual
  SELECT gabaritos INTO saldo_atual
  FROM public.user_gabaritos
  WHERE user_id = p_user_id;
  
  -- Se não existe registro, criar com saldo 0
  IF saldo_atual IS NULL THEN
    INSERT INTO public.user_gabaritos (user_id, gabaritos)
    VALUES (p_user_id, 0);
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
  WHERE user_id = p_user_id;
  
  -- Registrar transação
  INSERT INTO public.gabaritos_transactions (user_id, amount, type, description, simulado_id)
  VALUES (p_user_id, -custo, 'deduction', 
          format('Simulado: %s questões', p_total_questoes), 
          p_simulado_id);
  
  RETURN TRUE;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.deduct_gabaritos_manual IS 'Desconta gabaritos manualmente após criação bem-sucedida do simulado. Chamada pela edge function gerar-questoes.';
