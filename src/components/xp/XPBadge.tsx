import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { buscarXPUsuario, getEmojiNivel, getCorNivel } from "@/lib/xp-system";
import type { XPInfo } from "@/types/xp-system";

interface XPBadgeProps {
  userId: string;
  compact?: boolean;
}

export function XPBadge({ userId, compact = false }: XPBadgeProps) {
  const [xpInfo, setXpInfo] = useState<XPInfo | null>(null);

  useEffect(() => {
    loadXPInfo();
  }, [userId]);

  const loadXPInfo = async () => {
    try {
      const data = await buscarXPUsuario(userId);
      setXpInfo(data);
    } catch (error) {
      console.error("Erro ao carregar XP:", error);
    }
  };

  if (!xpInfo) return null;

  const emoji = getEmojiNivel(xpInfo.nivel);
  const corTexto = getCorNivel(xpInfo.nivel);

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-full border-2 border-border bg-white px-3 py-1.5 shadow-soft">
        <span className="text-sm">{emoji}</span>
        <span className={`text-sm font-black ${corTexto}`}>
          Nv. {xpInfo.nivel}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-full border-2 border-border bg-white px-4 py-2 shadow-soft">
      <span className="text-lg">{emoji}</span>
      <div className="flex items-center gap-2">
        <span className={`text-lg font-black ${corTexto}`}>
          Nível {xpInfo.nivel}
        </span>
        <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <Zap className="h-3 w-3 text-[#f7cf3d]" />
          {xpInfo.total_xp} XP
        </div>
      </div>
    </div>
  );
}
