-- Adicionar permissões GRANT para funções RPC do sistema de Gabaritos
-- Isso resolve o erro 406 (Not Acceptable) ao chamar as RPCs

-- Função principal: adicionar Gabaritos (compra/recompensa)
GRANT EXECUTE ON FUNCTION public.add_gabaritos(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_gabaritos(UUID, INTEGER, TEXT) TO anon;

-- Função para obter saldo de Gabaritos
GRANT EXECUTE ON FUNCTION public.get_gabaritos_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_gabaritos_balance(UUID) TO anon;

-- Função para calcular custo de simulado
GRANT EXECUTE ON FUNCTION public.calculate_simulado_cost(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_simulado_cost(INTEGER) TO anon;
