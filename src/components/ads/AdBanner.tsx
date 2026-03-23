import { useEffect, useRef } from 'react';
import { useIsPremium } from '@/hooks/useIsPremium';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdBanner({ 
  slot, 
  format = 'auto', 
  style,
  className = ''
}: AdBannerProps) {
  const { isPremium, loading } = useIsPremium();
  const adRef = useRef<HTMLModElement>(null);
  
  useEffect(() => {
    // Não carregar ad se for premium ou ainda estiver carregando
    if (loading || isPremium) return;
    
    try {
      // Push do ad para o AdSense
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Erro ao carregar AdSense:', error);
    }
  }, [loading, isPremium]);
  
  // Não mostrar ads enquanto carrega ou se for premium
  if (loading || isPremium) return null;
  
  return (
    <div className={`ad-container my-4 ${className}`}>
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-6935980559364656"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
