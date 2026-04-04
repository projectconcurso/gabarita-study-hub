import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StudySession {
  id: string;
  user_id: string;
  assunto_id: string;
  inicio: string;
  fim?: string;
  duracao_segundos?: number;
  tipo: "apostila" | "simulado";
}

interface UseStudyTimerProps {
  userId: string;
  assuntoId: string;
  tipo: "apostila" | "simulado";
  isActive: boolean; // Se o usuário está ativamente estudando
}

export function useStudyTimer({ userId, assuntoId, tipo, isActive }: UseStudyTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Inicia ou para a sessão de estudo
  useEffect(() => {
    const startSession = async () => {
      if (!userId || !assuntoId) return;

      try {
        startTimeRef.current = new Date();
        const { data, error } = await (supabase
          .from("sessoes_estudo") as any)
          .insert({
            user_id: userId,
            assunto_id: assuntoId,
            tipo,
            inicio: startTimeRef.current.toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Erro ao criar sessão de estudo:", error);
          return;
        }

        sessionIdRef.current = data?.id;
        console.log("Sessão de estudo iniciada:", sessionIdRef.current);
      } catch (error) {
        console.error("Erro ao iniciar sessão:", error);
      }
    };

    const endSession = async () => {
      if (!sessionIdRef.current || !startTimeRef.current) return;

      try {
        const endTime = new Date();
        const duracaoSegundos = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);

        const { error } = await (supabase
          .from("sessoes_estudo") as any)
          .update({
            fim: endTime.toISOString(),
            duracao_segundos: duracaoSegundos,
          })
          .eq("id", sessionIdRef.current);

        if (error) {
          console.error("Erro ao finalizar sessão de estudo:", error);
        } else {
          console.log(`Sessão finalizada: ${duracaoSegundos}s`);
        }

        sessionIdRef.current = null;
        startTimeRef.current = null;
      } catch (error) {
        console.error("Erro ao finalizar sessão:", error);
      }
    };

    if (isActive) {
      setIsRunning(true);
      void startSession();
      
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      setIsRunning(false);
      void endSession();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Finaliza sessão ao desmontar componente
      if (sessionIdRef.current) {
        void endSession();
      }
    };
  }, [isActive, userId, assuntoId, tipo]);

  // Formata o tempo em HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRunning,
    currentTime,
    formattedTime: formatTime(currentTime),
  };
}
