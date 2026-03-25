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

        // Verificar subscription_status na tabela profiles
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar status de assinatura:', error);
          setIsPremium(false);
          setLoading(false);
          return;
        }

        // Usuário é premium se subscription_status = 'active' ou 'trial'
        // Apenas usuários sem assinatura (free) veem anúncios
        const isPremiumUser = profile?.subscription_status === 'active' || 
                              profile?.subscription_status === 'trial';
        setIsPremium(isPremiumUser);
        
        console.log('Status de assinatura:', profile?.subscription_status, '- É premium?', isPremiumUser);
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
