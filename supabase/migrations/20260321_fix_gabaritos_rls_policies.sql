-- Adicionar políticas RLS para permitir que usuários autenticados insiram/atualizem seus próprios Gabaritos
-- Isso permite que o componente React adicione Gabaritos diretamente sem usar RPC

-- Política para user_gabaritos: permitir que usuários vejam e atualizem seus próprios Gabaritos
DROP POLICY IF EXISTS "Users can view their own gabaritos" ON public.user_gabaritos;
CREATE POLICY "Users can view their own gabaritos"
ON public.user_gabaritos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own gabaritos" ON public.user_gabaritos;
CREATE POLICY "Users can insert their own gabaritos"
ON public.user_gabaritos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own gabaritos" ON public.user_gabaritos;
CREATE POLICY "Users can update their own gabaritos"
ON public.user_gabaritos
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para gabaritos_transactions: permitir que usuários insiram suas próprias transações
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.gabaritos_transactions;
CREATE POLICY "Users can view their own transactions"
ON public.gabaritos_transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.gabaritos_transactions;
CREATE POLICY "Users can insert their own transactions"
ON public.gabaritos_transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Garantir que RLS está habilitado
ALTER TABLE public.user_gabaritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gabaritos_transactions ENABLE ROW LEVEL SECURITY;

-- Adicionar permissões GRANT para as funções RPC
GRANT EXECUTE ON FUNCTION public.add_gabaritos(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_gabaritos_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_simulado_cost(INTEGER) TO authenticated;
