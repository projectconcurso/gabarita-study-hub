import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Coins, AlertCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { gerarApostila } from "@/lib/meus-estudos";
import { supabase } from "@/integrations/supabase/client";
import { RewardedVideoAd } from "@/components/ads/RewardedVideoAd";

interface GerarApostilaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  assuntoId: string;
  nomeAssunto: string;
  nomeMateria: string;
  onSuccess: () => void;
}

export function GerarApostilaDialog({
  open,
  onOpenChange,
  userId,
  assuntoId,
  nomeAssunto,
  nomeMateria,
  onSuccess,
}: GerarApostilaDialogProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saldoGabaritos, setSaldoGabaritos] = useState<number>(0);
  const [canWatchVideo, setCanWatchVideo] = useState(false);
  const [isCheckingVideo, setIsCheckingVideo] = useState(true);

  const APPLIXIR_API_KEY = import.meta.env.VITE_APPLIXIR_API_KEY || "";
  const APPLIXIR_ZONE_ID = import.meta.env.VITE_APPLIXIR_ZONE_ID || "2050";

  useEffect(() => {
    if (open) {
      loadSaldo();
      checkVideoAvailability();
    }
  }, [open]);

  const loadSaldo = async () => {
    const { data } = await supabase
      .from("user_gabaritos")
      .select("gabaritos")
      .eq("user_id", userId)
      .single();
    
    if (data && 'gabaritos' in data) {
      setSaldoGabaritos((data as any).gabaritos ?? 0);
    } else {
      setSaldoGabaritos(0);
    }
  };

  const checkVideoAvailability = async () => {
    setIsCheckingVideo(true);
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      const { count, error } = await supabase
        .from('gabaritos_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayStart)
        .eq('type', 'reward')
        .ilike('description', '%vídeo%');

      setCanWatchVideo(error ? false : (count || 0) === 0);
    } catch {
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
    loadSaldo();
    checkVideoAvailability();
  };

  const handleVideoStart = () => {
    onOpenChange(false);
  };

  const handleGerar = async () => {
    if (saldoGabaritos < 5) {
      toast.error("Você precisa de 5 Gabaritos para gerar um resumo");
      return;
    }

    try {
      setLoading(true);
      const resultado = await gerarApostila(assuntoId, userId, nomeAssunto, nomeMateria);

      if (resultado.success) {
        toast.success("Resumo gerado com sucesso!");
        onOpenChange(false);
        onSuccess();
      } else if (resultado.error) {
        toast.error(resultado.error);
      }
    } catch (error) {
      console.error("Erro ao gerar resumo:", error);
      toast.error("Erro ao gerar resumo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] border-4 border-border bg-white shadow-strong sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f7cf3d] border-4 border-border">
            <BookOpen className="h-8 w-8 text-foreground" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase text-center">
            Gerar Resumo
          </DialogTitle>
          <DialogDescription className="font-semibold text-muted-foreground text-center">
            Material de estudo completo gerado por IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-[1.5rem] border-2 border-border bg-muted p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Matéria:</span>
                <span className="text-base font-black text-foreground">{nomeMateria}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Assunto:</span>
                <span className="text-base font-black text-foreground">{nomeAssunto}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Custo:</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-[#f7cf3d]" />
                  <span className="text-lg font-black text-foreground">5</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-[1.5rem] border-2 border-border p-4 ${saldoGabaritos >= 5 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Seu saldo:</span>
                <div className="flex items-center gap-1">
                  <Coins className={`h-4 w-4 ${saldoGabaritos >= 5 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-lg font-black text-foreground">{saldoGabaritos}</span>
                </div>
              </div>
              {saldoGabaritos < 5 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Faltam:</span>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-red-600" />
                    <span className="text-lg font-black text-foreground">{5 - saldoGabaritos}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {saldoGabaritos < 5 && !isCheckingVideo && canWatchVideo && (
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

          {saldoGabaritos < 5 && !isCheckingVideo && !canWatchVideo && (
            <div className="rounded-[1.5rem] border-2 border-border bg-muted p-4">
              <p className="text-xs font-semibold text-muted-foreground text-center">
                ⏰ Você já assistiu seu vídeo grátis hoje. Volte amanhã!
              </p>
            </div>
          )}

          {saldoGabaritos >= 5 && (
            <div className="space-y-2 rounded-[1.5rem] border-2 border-border bg-blue-50 p-4">
              <p className="text-xs font-bold text-blue-900">ℹ️ O que você vai receber:</p>
              <ul className="space-y-1 text-xs font-semibold text-blue-700">
                <li>• Introdução ao assunto</li>
                <li>• Conceitos fundamentais</li>
                <li>• Desenvolvimento teórico completo</li>
                <li>• Exemplos práticos resolvidos</li>
                <li>• Dicas e macetes para provas</li>
                <li>• Resumo e pontos de atenção</li>
              </ul>
            </div>
          )}

          {saldoGabaritos < 5 && (
            <div className="rounded-[1.5rem] border-2 border-border bg-[#f7cf3d] p-4">
              <p className="text-sm font-semibold text-foreground text-center">
                💡 Ou adquira mais Gabaritos na loja!
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t-2 border-border pt-4">
          {saldoGabaritos >= 5 ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-full border-2 border-border font-bold"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGerar}
                className="flex-1 rounded-full border-2 border-border bg-primary font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                disabled={loading}
              >
                {loading ? "Gerando..." : "Gerar Resumo"}
              </Button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
