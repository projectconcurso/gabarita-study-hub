-- Função para deduzir Gabaritos (usada pela edge function gerar-apostila)
-- Data: 2026-03-26

CREATE OR REPLACE FUNCTION public.deduct_gabaritos(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Verificar saldo atual
  SELECT gabaritos INTO v_current_balance
  FROM user_gabaritos
  WHERE user_id = p_user_id;

  -- Se não encontrou registro, criar com saldo 0
  IF NOT FOUND THEN
    INSERT INTO user_gabaritos (user_id, gabaritos)
    VALUES (p_user_id, 0);
    v_current_balance := 0;
  END IF;

  -- Verificar se tem saldo suficiente
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente. Saldo atual: %, necessário: %', v_current_balance, p_amount;
  END IF;

  -- Deduzir Gabaritos
  UPDATE user_gabaritos
  SET gabaritos = gabaritos - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Registrar transação
  INSERT INTO gabaritos_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'deduction', p_description);
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.deduct_gabaritos IS 'Deduz Gabaritos do saldo do usuário e registra transação';
