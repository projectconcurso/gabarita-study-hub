import { X } from 'lucide-react';
import { useIsPremium } from '@/hooks/useIsPremium';

interface MontagInterstitialProps {
  show: boolean;
  onClose: () => void;
}

export function MontagInterstitial({ 
  show, 
  onClose
}: MontagInterstitialProps) {
  const { isPremium } = useIsPremium();

  // Não renderizar nada se for premium ou não deve mostrar
  if (isPremium || !show) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="Fechar"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        {/* Container do anúncio */}
        <div className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="space-y-6">
            <div className="text-6xl">📢</div>
            <h3 className="text-2xl font-black uppercase text-foreground">
              Pausa para Anúncio
            </h3>
            <p className="text-lg text-muted-foreground max-w-md">
              Continue respondendo após fechar este anúncio.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="rounded-full border-2 border-border bg-primary text-primary-foreground px-8 py-3 font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Continuar Simulado
              </button>
            </div>
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
