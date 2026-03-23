import { useEffect, useRef } from 'react';
import { useIsPremium } from '@/hooks/useIsPremium';

interface PropellerBannerProps {
  zoneId: string;
  width?: number;
  height?: number;
  className?: string;
}

declare global {
  interface Window {
    atAsyncOptions?: any[];
  }
}

export function PropellerBanner({ 
  zoneId, 
  width = 300, 
  height = 250,
  className = ''
}: PropellerBannerProps) {
  const { isPremium, loading } = useIsPremium();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Não carregar ad se for premium ou ainda estiver carregando
    if (loading || isPremium) return;
    
    // Limpar container antes de adicionar novo script
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    try {
      // Configurar atOptions ANTES de carregar o script
      const atOptions = {
        'key': zoneId,
        'format': 'iframe',
        'height': height,
        'width': width,
        'params': {}
      };
      
      // Criar elemento de configuração
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.text = `atOptions = ${JSON.stringify(atOptions)};`;
      
      // Criar script do PropellerAds
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//5gvci.com/${zoneId}/invoke.js`;
      
      // Adicionar ao container na ordem correta
      if (containerRef.current) {
        containerRef.current.appendChild(configScript);
        containerRef.current.appendChild(invokeScript);
      }
    } catch (error) {
      console.error('Erro ao carregar PropellerAds:', error);
    }
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [zoneId, width, height, loading, isPremium]);
  
  // Não mostrar ads enquanto carrega ou se for premium
  if (loading || isPremium) return null;
  
  return (
    <div 
      ref={containerRef}
      className={`propeller-ad-container ${className}`}
      style={{ 
        minWidth: width, 
        minHeight: height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1rem 0'
      }}
    />
  );
}
