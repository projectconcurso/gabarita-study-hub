import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useIsPremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPremiumStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsPremium(false);
          setLoading(false);
          return;
        }

        // TODO: Implementar verificação de assinatura quando tabela subscriptions existir
        // Por enquanto, todos os usuários veem ads (não são premium)
        setIsPremium(false);
      } catch (error) {
        console.error('Erro ao verificar premium:', error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    }

    checkPremiumStatus();

    // Revalidar quando usuário fizer login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkPremiumStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isPremium, loading };
}
