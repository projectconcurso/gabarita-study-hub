import { Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GabaritosBalanceProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function GabaritosBalance({ showLabel = true, size = 'md' }: GabaritosBalanceProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();
    
    // Atualizar saldo em tempo real
    const channel = supabase
      .channel('gabaritos-balance')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'gabaritos_transactions'
      }, () => {
        loadBalance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar saldo atual
      const { data, error } = await supabase
        .from('user_gabaritos')
        .select('gabaritos')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setBalance(0);
        return;
      }
      
      setBalance((data as any).gabaritos ?? 0);
    } catch (error) {
      console.error('Erro ao carregar saldo de Gabaritos:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
        <div className="w-16 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${sizeClasses[size]}`}>
      <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-600 shadow-md ${
        showLabel ? 'w-8 h-8' : 'w-6 h-6'
      }`}>
        <Coins className={`${showLabel ? iconSizes[size] : 'h-3 w-3'} text-white`} />
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Gabaritos</span>
          <span className="font-bold text-gray-900">{balance.toLocaleString('pt-BR')}</span>
        </div>
      )}
      {!showLabel && (
        <span className="text-xs font-black text-gray-900">{balance.toLocaleString('pt-BR')}</span>
      )}
    </div>
  );
}
