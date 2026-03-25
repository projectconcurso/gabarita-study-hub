import { useState, useEffect } from 'react';

interface UseAdTriggerOptions {
  questionsInterval?: number; // A cada quantas questões mostrar anúncio
  enabled?: boolean; // Se o sistema de anúncios está ativo
}

export function useAdTrigger({ 
  questionsInterval = 5, 
  enabled = true 
}: UseAdTriggerOptions = {}) {
  const [showAd, setShowAd] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Função para incrementar contador de questões respondidas
  const incrementQuestions = () => {
    if (!enabled) return;

    const newCount = questionsAnswered + 1;
    setQuestionsAnswered(newCount);

    // Mostrar anúncio a cada X questões
    if (newCount % questionsInterval === 0) {
      setShowAd(true);
    }
  };

  // Função para fechar anúncio
  const closeAd = () => {
    setShowAd(false);
  };

  // Função para resetar contador (útil ao iniciar novo simulado)
  const reset = () => {
    setQuestionsAnswered(0);
    setShowAd(false);
  };

  return {
    showAd,
    closeAd,
    incrementQuestions,
    questionsAnswered,
    reset,
  };
}
