import { useEffect } from 'react';
import { useIsPremium } from '@/hooks/useIsPremium';

export function MonetagVignette() {
  const { isPremium, loading } = useIsPremium();

  useEffect(() => {
    // Não carregar se for premium ou ainda estiver carregando
    if (loading || isPremium) return;

    // Verificar se o script já foi carregado
    const existingScript = document.querySelector('script[src*="izcle.com/vignette.min.js"]');
    if (existingScript) return;

    try {
      // Criar e adicionar script do Monetag Vignette
      const script = document.createElement('script');
      script.dataset.zone = '10781786';
      script.src = 'https://izcle.com/vignette.min.js';
      
      // Adicionar ao body
      const target = document.body || document.documentElement;
      target.appendChild(script);
      
      console.log('Monetag Vignette carregado');
    } catch (error) {
      console.error('Erro ao carregar Monetag Vignette:', error);
    }

    // Cleanup não é necessário pois o Vignette deve persistir durante toda a sessão
  }, [loading, isPremium]);

  // Componente não renderiza nada visível
  return null;
}
