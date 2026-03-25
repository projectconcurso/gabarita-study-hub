-- Atualizar função grant_trial_gabaritos para conceder 100 Gabaritos (ao invés de 50)
-- Reflete nova política: 7 dias de trial com 100 Gabaritos

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
  
  -- Se não existe registro, criar com 100 Gabaritos
  INSERT INTO public.user_gabaritos (user_id, gabaritos, trial_gabaritos_granted, trial_started_at)
  VALUES (p_user_id, 100, TRUE, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET gabaritos = public.user_gabaritos.gabaritos + 100,
      trial_gabaritos_granted = TRUE,
      trial_started_at = NOW(),
      updated_at = NOW();
  
  -- Registrar transação
  INSERT INTO public.gabaritos_transactions (user_id, amount, type, description)
  VALUES (p_user_id, 100, 'trial_grant', 'Gabaritos de trial (7 dias)');
  
  RETURN TRUE;
END;
$$;

-- Atualizar comentário da função
COMMENT ON FUNCTION public.grant_trial_gabaritos IS 'Concede 100 Gabaritos de trial (uma vez por usuário, 7 dias)';
