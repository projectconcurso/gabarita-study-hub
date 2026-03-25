import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useIsPremium } from '@/hooks/useIsPremium';

interface MontagInterstitialProps {
  show: boolean;
  onClose: () => void;
  zoneId?: string;
}

export function MontagInterstitial({ 
  show, 
  onClose,
  zoneId = '10781786' 
}: MontagInterstitialProps) {
  const { isPremium } = useIsPremium();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Não mostrar se for premium ou se não deve mostrar
    if (isPremium || !show) return;

    // Carregar script do Vignette
    const script = document.createElement('script');
    script.innerHTML = `(function(s){s.dataset.zone='${zoneId}',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    
    document.body.appendChild(script);
    setIsLoaded(true);

    // Simular abertura do Vignette
    setTimeout(() => {
      // O Vignette será exibido automaticamente pelo script
    }, 100);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [show, isPremium, zoneId]);

  // Não renderizar nada se for premium ou não deve mostrar
  if (isPremium || !show) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
          aria-label="Fechar anúncio"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        {/* Container do anúncio */}
        <div className="p-8 min-h-[400px] flex items-center justify-center">
          <div id="monetag-ad-container" className="w-full">
            {!isLoaded && (
              <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Carregando anúncio...</p>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Dica:</strong> Assine o plano Premium para remover anúncios e ter acesso ilimitado!
          </p>
        </div>
      </div>
    </div>
  );
}
