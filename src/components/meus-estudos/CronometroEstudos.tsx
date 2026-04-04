import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, Square } from "lucide-react";
import { toast } from "sonner";
import { iniciarSessaoEstudo, finalizarSessaoEstudo } from "@/lib/meus-estudos";

interface CronometroEstudosProps {
  userId: string;
  assuntoId: string;
  onUpdate: () => void;
}

export function CronometroEstudos({ userId, assuntoId, onUpdate }: CronometroEstudosProps) {
  const [ativo, setAtivo] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (ativo) {
      intervalRef.current = setInterval(() => {
        setSegundos((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ativo]);

  const formatarTempo = (totalSegundos: number): string => {
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segs = totalSegundos % 60;

    if (horas > 0) {
      return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
    }
    return `${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
  };

  const handleIniciar = async () => {
    try {
      const id = await iniciarSessaoEstudo(userId, assuntoId);
      setSessaoId(id);
      setAtivo(true);
      toast.success("Cronômetro iniciado!");
    } catch (error) {
      console.error("Erro ao iniciar cronômetro:", error);
      toast.error("Erro ao iniciar cronômetro");
    }
  };

  const handlePausar = () => {
    setAtivo(false);
  };

  const handleRetomar = () => {
    setAtivo(true);
  };

  const handleParar = async () => {
    if (!sessaoId) return;

    try {
      await finalizarSessaoEstudo(sessaoId);
      setAtivo(false);
      setSegundos(0);
      setSessaoId(null);
      toast.success("Sessão de estudo finalizada!");
      onUpdate();
    } catch (error) {
      console.error("Erro ao finalizar sessão:", error);
      toast.error("Erro ao finalizar sessão");
    }
  };

  if (!sessaoId) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleIniciar}
        className="rounded-full border-2 border-border font-bold"
      >
        <Clock className="w-4 h-4 mr-1" />
        Iniciar Cronômetro
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-full border-2 border-border bg-white px-3 py-1.5">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-black tabular-nums">{formatarTempo(segundos)}</span>
      </div>
      
      {ativo ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handlePausar}
          className="h-8 w-8 rounded-full border-2 border-border p-0"
        >
          <Pause className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={handleRetomar}
          className="h-8 w-8 rounded-full border-2 border-border p-0"
        >
          <Play className="w-4 h-4" />
        </Button>
      )}
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleParar}
        className="h-8 w-8 rounded-full border-2 border-border p-0 hover:bg-destructive/10"
      >
        <Square className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
}
