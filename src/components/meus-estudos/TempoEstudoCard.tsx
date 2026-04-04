import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { calcularTempoConcurso } from "@/lib/meus-estudos";
import type { Concurso } from "@/types/meus-estudos";

interface TempoEstudoCardProps {
  userId: string;
  concurso: Concurso;
}

export function TempoEstudoCard({ userId, concurso }: TempoEstudoCardProps) {
  const [tempoTotal, setTempoTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTempoEstudo();
  }, [userId, concurso.id]);

  const loadTempoEstudo = async () => {
    try {
      setLoading(true);
      // Busca tempo real do concurso
      const tempo = await calcularTempoConcurso(userId, concurso.id);
      setTempoTotal(tempo);
    } catch (error) {
      console.error("Erro ao carregar tempo de estudo:", error);
      // Em caso de erro, mostra 0
      setTempoTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    
    if (horas > 0) {
      return `${horas}h ${minutos > 0 ? `${minutos}min` : ''}`;
    } else if (minutos > 0) {
      return `${minutos}min`;
    } else {
      return '0min';
    }
  };

  if (loading) {
    return (
      <Card className="rounded-[1rem] border-2 border-border bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
              <div className="h-3 w-16 animate-pulse rounded bg-muted mt-1"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[1rem] border-2 border-[#f7cf3d] bg-gradient-to-r from-[#f7cf3d]/5 to-transparent shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7cf3d]">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Tempo de Estudo</p>
              <p className="text-lg font-black text-foreground">{formatarTempo(tempoTotal)}</p>
            </div>
          </div>
          
          {tempoTotal > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-bold text-[#f7cf3d]">
                {Math.floor(tempoTotal / 3600)}h {Math.floor((tempoTotal % 3600) / 60)}min
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
