/**
 * Calcula o custo em Gabaritos baseado na quantidade de questões
 * 
 * Tabela de preços:
 * - 5 a 20 questões: 5 Gabaritos
 * - 21 a 40 questões: 10 Gabaritos
 * - 41 a 60 questões: 15 Gabaritos
 * - 61 a 80 questões: 20 Gabaritos
 * 
 * Limite máximo: 80 questões
 */
export function calculateSimuladoCost(questoesCount: number): number {
  if (questoesCount <= 0 || questoesCount > 80) {
    throw new Error('Número de questões deve estar entre 1 e 80');
  }
  
  if (questoesCount >= 5 && questoesCount <= 20) {
    return 5;
  } else if (questoesCount >= 21 && questoesCount <= 40) {
    return 10;
  } else if (questoesCount >= 41 && questoesCount <= 60) {
    return 15;
  } else if (questoesCount >= 61 && questoesCount <= 80) {
    return 20;
  } else {
    // Menos de 5 questões também custa 5
    return 5;
  }
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
