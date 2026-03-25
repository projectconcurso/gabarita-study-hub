import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  const [canClose, setCanClose] = useState(false);
  
  // Timer de 10 segundos antes de permitir fechar
  useEffect(() => {
    if (!isOpen || loading || isPremium) return;
    
    // Resetar timer quando modal abre
    setSecondsRemaining(10);
    setCanClose(false);
    
    // Countdown de 10 segundos
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen, loading, isPremium]);
  
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
        // Criar script de configuração atOptions
        const configScript = document.createElement('script');
        configScript.type = 'text/javascript';
        configScript.text = `
          atOptions = {
            'key' : '15a7f63709ce86d0a30989c21e9fa3ad',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
          };
        `;
        
        // Criar script do Adsterra Banner Display
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://www.highperformanceformat.com/15a7f63709ce86d0a30989c21e9fa3ad/invoke.js';
        
        // Adicionar ao container
        containerRef.current.appendChild(configScript);
        containerRef.current.appendChild(script);
        scriptLoadedRef.current = true;
        
        console.log('Adsterra Banner Display carregado no modal');
      } catch (error) {
        console.error('Erro ao carregar Adsterra Banner:', error);
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
  
  const modalContent = (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 z-[99999]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999
      }}
    >
      {/* Overlay - Cobre toda a tela */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-black/70"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        onClick={canClose ? onClose : undefined}
      />
      
      {/* Modal - Centralizado */}
      <div 
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-4"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <div 
          className="relative w-full max-w-2xl bg-white rounded-[2rem] border-4 border-border shadow-strong p-6 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          style={{ zIndex: 100000 }}
        >
          {/* Botão Fechar */}
          <button
            onClick={canClose ? onClose : undefined}
            disabled={!canClose}
            className={`absolute top-4 right-4 rounded-full border-2 border-border p-2 shadow-soft transition-all ${
              canClose 
                ? 'bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer' 
                : 'bg-gray-200 cursor-not-allowed opacity-50'
            }`}
            aria-label="Fechar"
          >
            {canClose ? (
              <X className="h-5 w-5" />
            ) : (
              <span className="h-5 w-5 flex items-center justify-center text-xs font-black">
                {secondsRemaining}
              </span>
            )}
          </button>
          
          {/* Título */}
          <div className="mb-4">
            <h3 className="text-xl font-black uppercase text-foreground">
              Apoie o Gabarit
            </h3>
            <p className="text-sm font-semibold text-muted-foreground mt-1">
              {canClose 
                ? 'Obrigado! Você pode fechar agora ou continuar estudando'
                : `Aguarde ${secondsRemaining} segundos para continuar...`
              }
            </p>
          </div>
          
          {/* Container do Banner Display */}
          <div 
            ref={containerRef}
            className="adsterra-banner-modal min-h-[90px] flex items-center justify-center bg-gray-50 rounded-xl p-4"
          />
          
          {/* Botão Continuar */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={canClose ? onClose : undefined}
              disabled={!canClose}
              className={`rounded-full border-2 border-border px-6 py-3 font-black uppercase shadow-soft transition-all ${
                canClose
                  ? 'bg-primary text-primary-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              {canClose ? 'Continuar Estudando' : `Aguarde ${secondsRemaining}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Renderizar usando Portal para garantir que está fora da hierarquia DOM
  return createPortal(modalContent, document.body);
}
