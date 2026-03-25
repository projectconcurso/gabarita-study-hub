import { useEffect, useRef } from 'react';
import { useIsPremium } from '@/hooks/useIsPremium';
import { X } from 'lucide-react';

interface NativeBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NativeBannerModal({ 
  isOpen,
  onClose
}: NativeBannerModalProps) {
  const { isPremium, loading } = useIsPremium();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  
  useEffect(() => {
    // Não carregar ad se for premium, ainda estiver carregando, ou modal fechado
    if (loading || isPremium || !isOpen) return;
    
    // Evitar carregar script múltiplas vezes
    if (scriptLoadedRef.current) return;
    
    // Aguardar um pouco para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      // Limpar container antes de adicionar novo script
      containerRef.current.innerHTML = '';
      
      try {
        // Criar container div com ID específico do Adsterra
        const adContainer = document.createElement('div');
        adContainer.id = 'container-3e40931ca3e753c488c9373c9b7e7ef8';
        
        // Criar script do Adsterra Native Banner
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = 'https://pl28973797.profitablecpmratenetwork.com/3e40931ca3e753c488c9373c9b7e7ef8/invoke.js';
        
        // Adicionar ao container
        containerRef.current.appendChild(adContainer);
        containerRef.current.appendChild(script);
        scriptLoadedRef.current = true;
        
        console.log('Adsterra Native Banner carregado no modal');
      } catch (error) {
        console.error('Erro ao carregar Adsterra Native Banner:', error);
      }
    }, 300);
    
    // Cleanup ao fechar modal
    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      scriptLoadedRef.current = false;
    };
  }, [loading, isPremium, isOpen]);
  
  // Bloquear scroll do body quando modal aberto
  useEffect(() => {
    if (isOpen && !loading && !isPremium) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, loading, isPremium]);
  
  // Não mostrar modal se for premium, estiver carregando, ou modal fechado
  if (loading || isPremium || !isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Overlay - Cobre toda a tela */}
      <div 
        className="absolute inset-0 bg-black/60"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
        onClick={onClose}
      />
      
      {/* Modal - Centralizado */}
      <div className="absolute inset-0 flex items-center justify-center p-4" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div 
          className="relative w-full max-w-2xl bg-white rounded-[2rem] border-4 border-border shadow-strong p-6 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full border-2 border-border bg-white p-2 shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all z-10"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Título */}
          <div className="mb-4">
            <h3 className="text-xl font-black uppercase text-foreground">
              Apoie o Gabarit
            </h3>
            <p className="text-sm font-semibold text-muted-foreground mt-1">
              Veja um anúncio rápido para continuar estudando gratuitamente
            </p>
          </div>
          
          {/* Container do Native Banner */}
          <div 
            ref={containerRef}
            className="adsterra-native-banner-modal min-h-[250px] flex items-center justify-center bg-gray-50 rounded-xl"
          />
          
          {/* Botão Continuar */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="rounded-full border-2 border-border bg-primary text-primary-foreground px-6 py-3 font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Continuar Estudando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
