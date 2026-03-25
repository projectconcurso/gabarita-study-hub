/**
 * Calcula o custo em Gabaritos baseado na quantidade de questões
 * Cada questão custa 2 Gabaritos
 * 
 * Tabela de preços:
 * - 5 questões: 10 Gabaritos
 * - 6-10 questões: 20 Gabaritos
 * - 11-15 questões: 30 Gabaritos
 * - 16-20 questões: 40 Gabaritos
 * 
 * Mínimo: 5 questões | Máximo: 20 questões
 */
export function calculateSimuladoCost(questoesCount: number): number {
  if (questoesCount < 5 || questoesCount > 20) {
    throw new Error('Número de questões deve estar entre 5 e 20');
  }
  
  // Cada questão custa 2 Gabaritos
  return questoesCount * 2;
}

/**
 * Formata o valor de Gabaritos para exibição
 */
export function formatGabaritos(amount: number): string {
  return amount.toLocaleString('pt-BR');
}

/**
 * Retorna a descrição do custo baseado na quantidade de questões
 */
export function getCostDescription(questoesCount: number): string {
  const cost = calculateSimuladoCost(questoesCount);
  return `${questoesCount} questões = ${cost} Gabaritos`;
}

/**
 * Verifica se o usuário tem saldo suficiente
 */
export function hasSufficientBalance(balance: number, cost: number): boolean {
  return balance >= cost;
}

/**
 * Calcula quantos simulados o usuário pode criar com o saldo atual
 */
export function calculatePossibleSimulados(balance: number, questoesCount: number): number {
  const cost = calculateSimuladoCost(questoesCount);
  return Math.floor(balance / cost);
}
