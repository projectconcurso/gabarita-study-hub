import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

interface LevelCardProps {
  variant?: "sidebar" | "mobile";
}

interface UserLevel {
  nivel: number;
  total_xp: number;
  xp_para_proximo_nivel: number;
  progresso_nivel: number;
}

export function LevelCard({ variant = "sidebar" }: LevelCardProps) {
  const [levelData, setLevelData] = useState<UserLevel>({
    nivel: 0,
    total_xp: 0,
    xp_para_proximo_nivel: 10,
    progresso_nivel: 0,
  });

  useEffect(() => {
    const loadLevelData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // @ts-ignore - RPC types will be available after full type generation
      const { data, error } = await supabase.rpc("buscar_xp_usuario", {
        p_user_id: user.id,
      });

      if (!error && data) {
        const xpData = data as any;
        setLevelData({
          nivel: xpData.nivel || 0,
          total_xp: xpData.total_xp || 0,
          xp_para_proximo_nivel: xpData.xp_para_proximo_nivel || 10,
          progresso_nivel: xpData.progresso_nivel || 0,
        });
      }
    };

    void loadLevelData();

    const channel = supabase
      .channel("level-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_xp",
        },
        () => {
          void loadLevelData();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const progressPercentage = levelData.progresso_nivel;
  const xpRestante = levelData.xp_para_proximo_nivel;

  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-1.5 rounded-full border-2 border-border bg-white px-2 py-1 shadow-soft shrink-0">
        <div className="relative h-6 w-6">
          <svg className="h-6 w-6 -rotate-90 transform">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 10}`}
              strokeDashoffset={`${2 * Math.PI * 10 * (1 - progressPercentage / 100)}`}
              className="text-blue-500 transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-foreground">{levelData.nivel}</span>
          </div>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[8px] font-bold uppercase text-muted-foreground">Level</span>
          <span className="text-[10px] font-black text-foreground">{levelData.total_xp} XP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-border bg-white p-2 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <div className="relative h-8 w-8 shrink-0">
          <svg className="h-8 w-8 -rotate-90 transform">
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - progressPercentage / 100)}`}
              className="text-blue-500 transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-foreground">{levelData.nivel}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-bold uppercase text-muted-foreground">Level</span>
          <span className="text-xs font-black text-foreground">{levelData.total_xp} XP</span>
        </div>
      </div>
    </div>
  );
}
