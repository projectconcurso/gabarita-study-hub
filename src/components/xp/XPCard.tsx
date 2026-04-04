import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap, TrendingUp } from "lucide-react";
import { buscarXPUsuario, getEmojiNivel, getTituloNivel, getCorNivel, getBgNivel } from "@/lib/xp-system";
import type { XPInfo } from "@/types/xp-system";
import { toast } from "sonner";

interface XPCardProps {
  userId: string;
}

export function XPCard({ userId }: XPCardProps) {
  const [xpInfo, setXpInfo] = useState<XPInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadXPInfo();
  }, [userId]);

  const loadXPInfo = async () => {
    try {
      setLoading(true);
      const data = await buscarXPUsuario(userId);
      setXpInfo(data);
    } catch (error) {
      console.error("Erro ao carregar XP:", error);
      toast.error("Erro ao carregar informações de XP");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="rounded-full border-4 border-border bg-[#f7cf3d] px-6 py-3 text-sm font-black uppercase text-foreground shadow-soft animate-pulse">
              Carregando...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!xpInfo) return null;

  const emoji = getEmojiNivel(xpInfo.nivel);
  const titulo = getTituloNivel(xpInfo.nivel);
  const corTexto = getCorNivel(xpInfo.nivel);
  const corFundo = getBgNivel(xpInfo.nivel);

  return (
    <Card className="rounded-[2rem] border-4 border-border bg-gradient-to-br from-white to-muted shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
            <Trophy className="h-6 w-6 text-[#f7cf3d]" />
            Seu Progresso
          </CardTitle>
          <div className={`rounded-full border-2 border-border ${corFundo} px-4 py-2 shadow-soft`}>
            <span className="text-2xl">{emoji}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nível e Título */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-muted-foreground">Nível Atual</p>
              <p className={`text-4xl font-black ${corTexto}`}>
                {xpInfo.nivel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-muted-foreground">Título</p>
              <p className={`text-xl font-black uppercase ${corTexto}`}>
                {titulo}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-[#f7cf3d]" />
              XP Total: {xpInfo.total_xp}
            </span>
            <span className="text-muted-foreground">
              {xpInfo.xp_para_proximo_nivel} XP para o próximo nível
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={xpInfo.progresso_nivel} 
              className="h-4 rounded-full border-2 border-border shadow-soft"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black text-foreground drop-shadow-sm">
                {xpInfo.progresso_nivel}%
              </span>
            </div>
          </div>
        </div>

        {/* Informações de Ganho de XP */}
        <div className="rounded-[1.5rem] border-2 border-border bg-muted p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-black uppercase">
            <TrendingUp className="h-4 w-4" />
            Como Ganhar XP
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">📝 Concluir Simulado</span>
              <span className="rounded-full border-2 border-border bg-white px-3 py-1 font-black text-[#f7cf3d]">
                +1 XP
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">📚 Ler Resumo</span>
              <span className="rounded-full border-2 border-border bg-white px-3 py-1 font-black text-[#f7cf3d]">
                +2 XP
              </span>
            </div>
          </div>
        </div>

        {/* Meta */}
        {xpInfo.nivel < 100 && (
          <div className="text-center">
            <p className="text-xs font-semibold text-muted-foreground">
              Continue estudando para alcançar o nível máximo! 🎯
            </p>
          </div>
        )}

        {xpInfo.nivel === 100 && (
          <div className="rounded-[1.5rem] border-2 border-purple-500 bg-purple-100 p-4 text-center">
            <p className="text-lg font-black uppercase text-purple-600">
              🎉 Parabéns! Você é um Mestre! 👑
            </p>
            <p className="text-sm font-semibold text-purple-600">
              Nível máximo alcançado!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
