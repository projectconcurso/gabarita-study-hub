import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingBag, AlertCircle } from "lucide-react";
import { RewardedVideoAd } from "@/components/ads/RewardedVideoAd";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InsufficientBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  required: number;
  available: number;
  questoesCount: number;
}

export function InsufficientBalanceDialog({
  open,
  onOpenChange,
  required,
  available,
  questoesCount
}: InsufficientBalanceDialogProps) {
  const navigate = useNavigate();
  const [canWatchVideo, setCanWatchVideo] = useState(false);
  const [isCheckingVideo, setIsCheckingVideo] = useState(true);

  // AppLixir credentials from environment variables
  const APPLIXIR_API_KEY = import.meta.env.VITE_APPLIXIR_API_KEY || "";
  const APPLIXIR_ZONE_ID = import.meta.env.VITE_APPLIXIR_ZONE_ID || "2050";

  useEffect(() => {
    if (open) {
      checkVideoAvailability();
    }
  }, [open]);

  const checkVideoAvailability = async () => {
    setIsCheckingVideo(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCanWatchVideo(false);
        setIsCheckingVideo(false);
        return;
      }

      // Verificar se já assistiu vídeo hoje
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      console.log('📅 Verificando disponibilidade de vídeo desde:', todayStart);
      
      const { count, error } = await supabase
        .from('gabaritos_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart)
        .eq('type', 'reward')
        .ilike('description', '%vídeo%');

      if (error) {
        console.error('❌ Erro ao verificar vídeos:', error);
        setCanWatchVideo(false);
      } else {
        console.log('🎬 Vídeos assistidos hoje:', count);
        // Pode assistir se count for 0 (não assistiu hoje)
        setCanWatchVideo((count || 0) === 0);
      }
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de vídeo:', error);
      setCanWatchVideo(false);
    } finally {
      setIsCheckingVideo(false);
    }
  };

  const handleGoToStore = () => {
    onOpenChange(false);
    navigate("/dashboard/loja");
  };

  const handleVideoReward = () => {
    // Após receber recompensa, verificar novamente
    checkVideoAvailability();
  };

  const handleVideoStart = () => {
    // Fechar o modal quando o vídeo iniciar para evitar conflitos
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] border-4 border-border bg-white shadow-strong sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 border-4 border-border">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase text-center">
            Saldo Insuficiente
          </DialogTitle>
          <DialogDescription className="font-semibold text-muted-foreground text-center">
            Você não tem Gabaritos suficientes para criar este simulado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações do simulado */}
          <div className="rounded-[1.5rem] border-2 border-border bg-muted p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Questões:</span>
                <span className="text-lg font-black text-foreground">{questoesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Custo:</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-[#f7cf3d]" />
                  <span className="text-lg font-black text-foreground">{required}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Saldo atual vs necessário */}
          <div className="rounded-[1.5rem] border-2 border-border bg-red-50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Seu saldo:</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-red-600" />
                  <span className="text-lg font-black text-foreground">{available}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Faltam:</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-red-600" />
                  <span className="text-lg font-black text-foreground">{required - available}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vídeo Recompensado */}
          {!isCheckingVideo && canWatchVideo && (
            <div className="rounded-[1.5rem] border-2 border-border bg-green-50 p-4">
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground mb-1">
                    🎬 Opção Grátis!
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Assista um vídeo e ganhe 10 Gabaritos grátis
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Disponível 1x por dia)
                  </p>
                </div>
                <RewardedVideoAd
                  apiKey={APPLIXIR_API_KEY}
                  zoneId={APPLIXIR_ZONE_ID}
                  rewardAmount={10}
                  onRewardGranted={handleVideoReward}
                  onVideoStart={handleVideoStart}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {!isCheckingVideo && !canWatchVideo && (
            <div className="rounded-[1.5rem] border-2 border-border bg-muted p-4">
              <p className="text-xs font-semibold text-muted-foreground text-center">
                ⏰ Você já assistiu seu vídeo grátis hoje. Volte amanhã!
              </p>
            </div>
          )}

          {/* Mensagem motivacional */}
          <div className="rounded-[1.5rem] border-2 border-border bg-[#f7cf3d] p-4">
            <p className="text-sm font-semibold text-foreground text-center">
              💡 Ou adquira mais Gabaritos na loja!
            </p>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              onClick={handleGoToStore}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Ir para a Loja
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              onClick={() => onOpenChange(false)}
            >
              Voltar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
