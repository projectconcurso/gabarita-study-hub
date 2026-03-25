import { useEffect, useRef } from 'react';
import { useIsPremium } from '@/hooks/useIsPremium';

interface AdsterraNativeBannerProps {
  className?: string;
}

export function AdsterraNativeBanner({ 
  className = ''
}: AdsterraNativeBannerProps) {
  const { isPremium, loading } = useIsPremium();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  
  useEffect(() => {
    // Não carregar ad se for premium ou ainda estiver carregando
    if (loading || isPremium) return;
    
    // Evitar carregar script múltiplas vezes
    if (scriptLoadedRef.current) return;
    
    // Limpar container antes de adicionar novo script
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    try {
      // Criar container div com ID específico do Adsterra
      const adContainer = document.createElement('div');
      adContainer.id = 'container-3e40931ca3e753c488c9373c9b7e7ef8';
      
      // Criar script do Adsterra Native Banner - Forçar HTTP para evitar erro SSL
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'http://pl28973797.profitablecpmratenetwork.com/3e40931ca3e753c488c9373c9b7e7ef8/invoke.js';
      
      // Adicionar ao container
      if (containerRef.current) {
        containerRef.current.appendChild(adContainer);
        containerRef.current.appendChild(script);
        scriptLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Erro ao carregar Adsterra Native Banner:', error);
    }
    
    // Cleanup
    return () => {
      scriptLoadedRef.current = false;
    };
  }, [loading, isPremium]);
  
  // Não mostrar ads enquanto carrega ou se for premium
  if (loading || isPremium) return null;
  
  return (
    <div 
      ref={containerRef}
      className={`adsterra-native-banner my-6 ${className}`}
      style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '120px',
        width: '100%'
      }}
    />
  );
}
